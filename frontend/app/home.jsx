// Homepage.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment when you set up token storage

// Define colors for easy theming (ideally, this would be in a shared file)
const COLORS = {
  primary: "#007BFF",
  white: "#FFFFFF",
  lightGray: "#F0F0F0",
  gray: "#CCCCCC",
  darkGray: "#888888",
  danger: "#DC3545",
  success: "#4CAF50",
  background: "#F8F9FA", // A light background color for the screen
};

export default function Homepage() {
  const router = useRouter(); // use router instead of navigation

  const handleLogout = async () => {
     try {
      const token = await AsyncStorage.getItem("token");
      console.log(token);
      await AsyncStorage.removeItem("token"); // remove token
      console.log("Token removed"); // debug line
      router.replace("/login"); // navigate to login
    } catch (error) {
      console.error("Error clearing token:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Welcome to Your App!</Text>
        <Text style={styles.subText}>
          This is your main dashboard. From here, you can access all the features of the application.
        </Text>

        {/* Card for the main action */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready to Start?</Text>
          <Text style={styles.cardText}>
            Press the button below to proceed to the file upload section.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate("Upload")} // Navigate to your upload screen
          >
            <Text style={styles.buttonText}>Go to Upload</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginBottom: 30,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});