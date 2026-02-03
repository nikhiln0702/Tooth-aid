import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import { API_ENDPOINTS } from "../config/api";

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
          title="Connect"
          iconName="flash"
          color={COLORS.blue}
          onPress={() => { /* router.push('/connect') */ }}
        />

        <ActionCard 
          title="Upload"
          iconName="cloud-upload"
          color={COLORS.success}
          onPress={() => router.push('/upload')}
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
});