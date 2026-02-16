import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Platform,
  Alert,
  Modal, // Added Modal
  ActivityIndicator, // For loading state
  ScrollView,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";
import io from "socket.io-client";

// --- UPDATED COLORS ---
const COLORS = {
  white: "#FFFFFF",
  background: "#F8F9FB", // Soft off-white for depth
  text: "#1A1A1A",
  textSecondary: "#7A7A7A",
  blue: "#005eff",
  gray: "#EAEAEA",
  iconGray: "#F2F2F2",
  activeTab: "#000000",
  inactiveTab: "#A0A0A0",
  success: "#4CAF50",
  warning: "#FF9500",
};
const PI_STREAM_URL = "http://10.165.12.1:8080/?action=stream";
const PI_SNAPSHOT_URL = "http://10.165.12.1:8080/?action=snapshot";
const SOCKET_URL = API_ENDPOINTS.SOCKET

export default function MainScreen() {
  const router = useRouter();

  // --- LOGIC (UNTOUCHED) ---
  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(API_ENDPOINTS.LOGOUT, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await AsyncStorage.removeItem("token");
      router.replace({ pathname: "/login" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const [userName, setUserName] = useState("");
  const [piStatus, setPiStatus] = useState("DISCONNECTED"); // DISCONNECTED, WAITING, CONNECTED
  const socketRef = useRef(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [streamLoading, setStreamLoading] = useState(true);
  const [displayUri, setDisplayUri] = useState(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decodedToken = jwtDecode(token);
          console.log(decodedToken);
          setUserName(decodedToken.name || "User");
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);
  useEffect(() => {
    // 1. Initialize Socket Connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    // 2. Listen for Pi Status Updates
    socketRef.current.on("PI_STATUS_UPDATE", (data) => {
      setPiStatus(data.status);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
  const handleConnectPi = () => {
    if (piStatus === "WAITING") {
      socketRef.current.emit("ui-authorize-pi");
      Alert.alert("Success", "Raspberry Pi authorized and linked!");
    } else if (piStatus === "DISCONNECTED") {
      Alert.alert("Offline", "No Raspberry Pi detected in the waiting room.");
    }
  };
  const handlePutPiInWaiting = () => {
    if (piStatus === "DISCONNECTED") {
      socketRef.current.emit("register-pi");
      Alert.alert("Status Updated", "Instruction sent to put Raspberry Pi in the waiting room.");
    } else {
      Alert.alert("Info", "Device is not currently availiable.");
    }
  };

  const handleDisconnectPi = () => {
    if (piStatus === "CONNECTED" || piStatus === "WAITING") {
      Alert.alert(
        "Disconnect",
        "Are you sure you want to unlink the Raspberry Pi?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Disconnect",
            style: "destructive",
            onPress: () => {
              socketRef.current.emit("pi-disconnect");
              Alert.alert("Success", "Raspberry Pi has been disconnected.");
            }
          }
        ]
      );
    } else {
      Alert.alert("Info", "No device currently linked.");
    }
  };

  // Simple frame loader — just set the URI, let expo-image handle the rest
  const loadNextFrame = () => {
    if (!activeRef.current) return;
    setDisplayUri(`${PI_SNAPSHOT_URL}&t=${Date.now()}`);
  };

  const openCamera = () => {
    console.log(piStatus);
    if (piStatus !== "CONNECTED") {
      Alert.alert("Error", "Please connect the Raspberry Pi first.");
      return;
    }
    socketRef.current.emit("ui-start-stream");
    setStreamLoading(true);
    setDisplayUri(null);
    setCameraVisible(true);
    
    setTimeout(() => {
      console.log("🚀 Pi ready, starting snapshot loop...");
      activeRef.current = true;
      loadNextFrame();
    }, 3000);
  };

  const closeCamera = () => {
    activeRef.current = false;
    socketRef.current.emit("ui-stop-stream");
    setCameraVisible(false);
  };

  const handleTriggerUpload = async () => {
    if (piStatus !== "CONNECTED") {
      Alert.alert("Error", "Please connect the Raspberry Pi first.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      // Trigger the backend to tell the Pi to capture
      const response = await axios.post(`${SOCKET_URL}/api/analysis/capture`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        closeCamera();
        Alert.alert("Capturing", "Photo taken! Analysis will appear in history momentarily.");
        socketRef.current.emit("ui-authorize-pi");
      }
      else {
        Alert.alert("Error", "Failed to trigger camera.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to trigger camera.");
    }
  };

  const [activeTab, setActiveTab] = useState("Home");

  // --- UI COMPONENTS ---
  const ActionCard = ({ title, iconName, onPress, color }) => (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        pressed && styles.actionCardPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.actionCardLeft}>
        <View style={[styles.actionIconContainer, { backgroundColor: color + "15" }]}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- CAMERA MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cameraVisible}
        onRequestClose={closeCamera}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>Align Camera</Text>

            {/* Live Stream View */}
            <View style={styles.streamContainer}>
              {displayUri && (
                <ExpoImage
                  source={{ uri: displayUri }}
                  style={styles.liveStream}
                  contentFit="contain"
                  cachePolicy="none"
                  onLoad={() => {
                    if (streamLoading) {
                      console.log("✅ First frame received!");
                      setStreamLoading(false);
                    }
                    // Chain next frame as soon as this one renders
                    loadNextFrame();
                  }}
                  onError={() => {
                    if (activeRef.current) {
                      setTimeout(loadNextFrame, 300);
                    }
                  }}
                />
              )}

              {streamLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={COLORS.blue} />
                  <Text style={{ color: 'white', marginTop: 10 }}>Waking up Pi Camera...</Text>
                </View>
              )}
              <View style={styles.guideBox} />
            </View>

            {/* Modal Controls */}
            <View style={styles.modalControls}>
              <Pressable style={styles.closeButton} onPress={closeCamera}>
                <Ionicons name="close" size={24} color={COLORS.text} />
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>

              <Pressable style={styles.captureButton} onPress={handleTriggerUpload}>
                <View style={styles.captureInnerCircle} />
              </Pressable>

              {/* Spacer for layout balance */}
              <View style={{ width: 60 }} />
            </View>

          </View>
        </View>
      </Modal>

      {/* --- Header --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{userName || "User"}</Text>
        </View>
        <Pressable
          style={styles.profileIconContainer}
          onPress={handleLogout}
        >
          <Image
            source={require('../assets/images/settings.png')}
            style={styles.profileIcon}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        {/* --- Action Cards --- */}
        <ActionCard
          title={piStatus === "CONNECTED" ? "Linked" : "Connect"}
          iconName="flash"
          color={piStatus === "CONNECTED" ? COLORS.success : COLORS.blue}
          onPress={handleConnectPi}
        />

        <ActionCard
          title="Start Camera"
          iconName="videocam"
          color={piStatus === "CONNECTED" ? COLORS.blue : COLORS.inactiveTab}
          onPress={openCamera}
        />

        <ActionCard
          title="Enter Waiting Room"
          iconName="hourglass"
          color={COLORS.inactiveTab}
          onPress={handlePutPiInWaiting}
        />

        <ActionCard
          title="Disconnect Device"
          iconName="close-circle"
          color={COLORS.danger}
          onPress={handleDisconnectPi}
        />

        <ActionCard
          title="History"
          iconName="time"
          color={COLORS.warning}
          onPress={() => router.push('/history')}
        />

        {/* Decorative Graphic Element */}
        <View style={styles.decorativeSpace}>
          <View style={styles.dashLine} />
          <Text style={styles.decorativeText}>Ready for your next analysis</Text>
        </View>
      </ScrollView>

      {/* --- Bottom Tab Bar --- */}
      <View style={styles.tabBar}>
        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab("Home")}
        >
          <Image
            source={require('../assets/images/home.png')}
            style={[
              styles.tabIcon,
              { tintColor: activeTab === 'Home' ? COLORS.activeTab : COLORS.inactiveTab }
            ]}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'Home' ? COLORS.activeTab : COLORS.inactiveTab }]}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabItem}
          onPress={() => setActiveTab("Profile")}
        >
          <Image
            source={require('../assets/images/profile.png')}
            style={[
              styles.tabIcon,
              { tintColor: activeTab === 'Profile' ? COLORS.activeTab : COLORS.inactiveTab }
            ]}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'Profile' ? COLORS.activeTab : COLORS.inactiveTab }]}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 100,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
  },
  headerGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.iconGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 22,
    height: 22,
  },
  // Section Header
  sectionHeader: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.inactiveTab,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Action Cards
  actionCard: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 24,
    marginBottom: 16,
    // Shadows
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  actionCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  // Decorative
  decorativeSpace: {
    alignItems: 'center',
    marginTop: 30,
    padding: 20,
  },
  dashLine: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    marginBottom: 12,
  },
  decorativeText: {
    color: COLORS.inactiveTab,
    fontSize: 13,
    fontWeight: '500',
  },
  // Tab Bar
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  // --- MODAL STYLES ---
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  streamContainer: {
    width: '100%',
    flex: 1, // Take up remaining space
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveStream: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    borderStyle: 'dashed',
  },
  modalControls: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.text,
  },
  captureInnerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.text,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  closeButtonText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
});