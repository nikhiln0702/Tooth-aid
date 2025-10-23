import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "react-native";
// Assuming you have this file as per your provided code
import { API_ENDPOINTS } from "../config/api"; 
// Mocking API_ENDPOINTS for the code to be runnable
// const API_ENDPOINTS = {
//   LOGIN: "https://api.example.com/login",
// };

// Import icons for social login buttons
import { AntDesign } from "@expo/vector-icons";

// Colors based on the UI design in the image
const COLORS = {
  white: "#FFFFFF",
  black: "#1C1C1E", // Using a slightly softer black for UI elements
  blue: "#005effff",
  trueBlack: "#000000",
  grayText: "#8A8A8E",
  placeholder: "#C7C7CD",
  inputBorder: "#EAEAEA",
  // Logo colors (approximations)
  logo1: "#63C9B3",
  logo2: "#E48C8C",
  logo3: "#F7D06F",
  logo4: "#69A6D3",
  logo5: "#3D5A80",
  danger: "#DC3545", // For error messages
};

// A simple component to recreate the logo from the image

function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(""); // State for displaying errors

  const handleLogin = async () => {
    // Clear previous errors
    setError("");
    // Prevent multiple submissions
    if (isLoading) return;

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting login with URL:", API_ENDPOINTS.LOGIN);
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      console.log("Response data:", res.data); // Debugging line
      if (res.data.token) {
        console.log("Login successful:", res.data);
        await AsyncStorage.setItem("token", res.data.token); // store token securely
        Alert.alert("Login Success", "You are logged in!");
        router.replace("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      // Provide a more specific error message if possible
      if (err.message === "Network Error") {
        setError("Cannot connect to server. Check your internet connection.");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            "Invalid credentials or server error."
        );
      }
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- Top Section --- */}
          <View style={styles.topSection}>
            {/* <AppLogo /> */}
            <Text style={styles.title}>Welcome Back</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                // The image shows a pre-filled value, but functionally
                // it's better as a placeholder if the state is empty.
                placeholder="samlee.mobbin@gmail.com"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                textContentType="password"
              />
            </View>

            {/* Error Message Display */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.loginButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Log in with Email</Text>
              )}
            </Pressable>

            {/* Forgot Password */}
            <Pressable
              style={styles.linkButton}
              onPress={() => {
                /* Handle forgot password navigation */
              }}
            >
              <Text style={styles.linkButtonText}>
                Forgot password?{" "}
                <Text style={styles.linkTextBold}>Reset it</Text>
              </Text>
            </Pressable>
          </View>

          {/* --- Bottom Section --- */}
          <View style={styles.bottomSection}>

            {/* Continue with Google */}
            <Pressable
             style={({ pressed }) => [
               styles.button,
               styles.socialButton,
               pressed && styles.buttonPressed,
             ]}
           >
             <Image
               source={require("../assets/images/google_logo.png")} // Adjust this path to your image
               style={[styles.socialIcon, { width: 20, height: 20 }]} // Set width/height for the image
             />
             <Text style={styles.socialButtonText}>Continue with Google</Text>
           </Pressable>

            

            {/* Sign Up Link */}
            <Pressable
              style={styles.linkButton}
              onPress={() => router.push("/signup")} // From user's logic
            >
              <Text style={styles.linkButtonText}>
                New user? <Text style={styles.linkTextBold}>Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  topSection: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    marginTop: 80
  },
  bottomSection: {
    paddingBottom: 20,
  },
  // Logo Styles
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    marginBottom: 30,
  },
  logoBar: {
    width: 8,
    height: 35,
    borderRadius: 2,
    marginHorizontal: 1.5,
  },
  // Title
  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 50,
    color: COLORS.trueBlack,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", // Using a serif font
  },
  // Input Styles
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.grayText,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    color: COLORS.trueBlack,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    paddingVertical: 10,
  },
  // Button Styles
  button: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: COLORS.blue,
    marginTop: 20,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  socialButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  socialButtonText: {
    color: COLORS.trueBlack,
    fontSize: 16,
    fontWeight: "600",
  },
  socialIcon: {
    position: "absolute",
    left: 24,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: "#555",
  },
  // Link Styles
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  linkButtonText: {
    fontSize: 14,
    color: COLORS.grayText,
  },
  linkTextBold: {
    fontWeight: "600",
    color: COLORS.trueBlack,
  },
  // Error Text
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});

export default LoginScreen;