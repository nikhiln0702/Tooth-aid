import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [piIpAddress, setPiIpAddress] = useState(null); 
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('PI_IP_ADDRESS');
        if (savedIp) setPiIpAddress(savedIp);
      } catch (error) {
        console.error("Failed to load IP config", error);
      } finally {
        setIsConfigLoaded(true);
      }
    };
    loadConfig();
  }, []);

  const savePiIpAddress = async (newIp) => {
    // Only save if it's a real IP and different from what we have
    if (newIp && newIp !== piIpAddress) {
        try {
          await AsyncStorage.setItem('PI_IP_ADDRESS', newIp);
          setPiIpAddress(newIp);
          console.log("💾 Saved new Pi IP locally:", newIp);
        } catch (error) {
          console.error("Failed to save IP config", error);
        }
    }
  };

  // Generate the URLs dynamically based on the current IP
  const getStreamUrl = () => `http://${piIpAddress}:8080/?action=stream`;
  const getSnapshotUrl = () => `http://${piIpAddress}:8080/?action=snapshot`;

  return (
    <ConfigContext.Provider value={{ piIpAddress, savePiIpAddress, getStreamUrl, getSnapshotUrl, isConfigLoaded }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);