import React,{useState,useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode"; // Import the decoder
import { Ionicons } from '@expo/vector-icons'; // For fallback icons

// Define colors based on the new image
const COLORS = {
  white: "#FFFFFF",
  background: "#FFFFFF", // The main background is white
  text: "#000000",
  blue: "#005effff",
  gray: "#CCCCCC",
  iconGray: "#F0F0F0", // Background for settings icon
  profileIconBg: "#C4C4C4", // Placeholder bg for the circle
  activeTab: "#000000",
  inactiveTab: "#BDBDBD",
};

export default function MainScreen() {
  const router = useRouter(); 

  // Logout logic from your Homepage.js
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      router.replace("/login"); // navigate to login
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  };
  // State to hold the user's name
  const [userName, setUserName] = useState(""); 

  // --- NEW EFFECT ---
  // This runs once when the component loads
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Decode the token
          const decodedToken = jwtDecode(token);
          
          // --- IMPORTANT ---
          // 'name' is a guess. Your token might use 'username', 'firstName', etc.
          console.log(decodedToken); // <-- UNCOMMENT THIS to see what's in your token
          setUserName(decodedToken.name || "User"); // Set the name from the token
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Handle error, maybe log out
      }
    };

    fetchUserData();
  }, []); // The empty array [] means this effect runs only once

  // State to track the active tab
  const [activeTab, setActiveTab] = useState("Home");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome, {userName}</Text>
        {/* Settings/Profile icon on the right, triggers logout */}
        <Pressable 
          style={styles.profileIconContainer} 
          onPress={handleLogout} // Attached logout to this button
        >
          {/* Settings icon; tap to logout */}
            <Image 
              source={require('../assets/images/settings.png')} 
              style={styles.profileIcon} 
            />
         
        </Pressable>
      </View>

      {/* Content Area - This is intentionally left blank to push tab bar down */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <Pressable 
          style={styles.button} 
          onPress={() => { router.push('/upload'); }}
        >
          <Text style={styles.buttonText}>Upload</Text>
        </Pressable>

        <Pressable 
          style={styles.button} 
          onPress={() => { router.push('/history'); }}
        >
          <Text style={styles.buttonText}>History</Text>
        </Pressable>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {/* Home Tab */}
        <Pressable 
          style={styles.tabItem} 
          onPress={() => {
            setActiveTab("Home");
            // router.push("/home"); // Uncomment to navigate
          }}
        >
          <Image 
            source={require('../assets/images/home.png')} 
            style={[
              styles.tabIcon, 
              { tintColor: activeTab === 'Home' ? COLORS.activeTab : COLORS.inactiveTab }
            ]} 
          />
          {/* Fallback Icon */}
          {/* <Ionicons 
            name="home" 
            size={28} 
            color={activeTab === 'Home' ? COLORS.activeTab : COLORS.inactiveTab} 
          /> */}
        </Pressable>

        {/* Profile Tab */}
        <Pressable 
          style={styles.tabItem} 
          onPress={() => {
            setActiveTab("Profile");
            // router.push("/profile"); // Uncomment to navigate
          }}
        >
          <Image 
            source={require('../assets/images/profile.png')} 
            style={[
              styles.tabIcon, 
              { tintColor: activeTab === 'Profile' ? COLORS.activeTab : COLORS.inactiveTab }
            ]} 
          />
          {/* Fallback Icon */}
          {/* <Ionicons 
            name="person" 
            size={28} 
            color={activeTab === 'Profile' ? COLORS.activeTab : COLORS.inactiveTab} 
          /> */}
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
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1, // This pushes the tab bar to the bottom
    justifyContent: 'center', // Vertically center the buttons
    alignItems: 'center',     // Horizontally center the buttons
    paddingHorizontal: 20,     // Add some side padding
    paddingBottom: 80,         // Ensure buttons aren't obscured by the tab bar
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.inactiveTab,
    marginBottom: 8,
  },
  button: {
    backgroundColor: COLORS.blue, // High-contrast button so it's clearly visible
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%', // Make buttons full-width (within padding)
    alignItems: 'center',
    marginVertical: 12,
    // subtle shadow (Android uses elevation)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.iconGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 20,
    height: 20,
  },
  // --- Tab Bar Styles ---
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Extra padding for home bar
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});
