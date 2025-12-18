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
  Image,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import { API_ENDPOINTS } from "../config/api"; // Your real API endpoint
import Checkbox from 'expo-checkbox'; // Import Checkbox
import { Ionicons } from '@expo/vector-icons'; // For the 'eye' icon

// Mocking API_ENDPOINTS for the code to be runnable


// --- STYLESHEET ---
// This COLORS palette is now consistent with your LoginScreen.js
const COLORS = {
  white: "#FFFFFF",
  trueBlack: "#000000",
  grayText: "#8A8A8E",
  placeholder: "#C7C7CD",
  inputBorder: "#EAEAEA",
  blue: "#005effff", // From your Login screen
  danger: "#DC3545",
  success: "#0800ffff", // From your original Signup logic
};

export default function SignupScreen() {
  const router = useRouter();
  // Renamed 'name' to 'username' to match the UI
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State for UI elements
  const [specialOffers, setSpecialOffers] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // State from your logic
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (isLoading) return;

    // Updated validation to use 'username'
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    const userData = {
      email
    };

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
      };
      console.log("Attempting signup with URL:", API_ENDPOINTS.SIGNUP);
      console.log("Signup payload:", payload);
      
      const res = await axios.post(API_ENDPOINTS.SIGNUP, payload);

      if (res.data?.message || res.status === 201) {
        Alert.alert(
          "Success",
          "Your account has been created successfully! Please verify your email."
        );
        router.push({
          pathname: "/otp-verification",
          params: userData, 
        });
      }
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url
      });
      setError(err.response?.data?.msg || err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if form is valid to enable the button
  const isFormValid = name && email && password;

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
            

            {/* Email Input - Styled like LoginScreen */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
              />
            </View>
            
            {/* Password Input - Styled like LoginScreen */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Choose a strong password"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  textContentType="password"
                />
                <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off" : "eye"} 
                    size={24} 
                    color={COLORS.placeholder} 
                  />
                </Pressable>
              </View>
            </View>

            {/* Name Input - Styled like LoginScreen */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.placeholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="none"
              />
            </View>


            {/* Error Message Display */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Signup Button - Styled like LoginScreen button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                // Use new signupButton style
                (!isFormValid || isLoading) ? styles.buttonDisabled : styles.signupButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignup}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>
                  Sign Up
                </Text>
              )}
            </Pressable>
          </View>

          {/* --- Bottom Section --- */}
          <View style={styles.bottomSection}>
            {/* Footer Legal Text - Styled like LoginScreen links */}
            <Text style={[styles.linkButtonText, styles.footerText]}>
              By clicking Sign Up, you agree to our
              <Text style={styles.linkTextBold}> User Agreement</Text> and
              <Text style={styles.linkTextBold}> Privacy Policy</Text>.
            </Text>

            {/* Login Link - Styled like LoginScreen links */}
            <Pressable
              style={styles.linkButton}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.linkButtonText}>
                Already have an account?{" "}
                <Text style={styles.linkTextBold}>Log In</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// --- STYLESHEET ---
// This StyleSheet is now consistent with your LoginScreen.js
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white, // Match Login
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between", // Match Login
    paddingHorizontal: 24,
  },
  topSection: {
    paddingTop: Platform.OS === "android" ? 40 : 20,
    marginTop: 120,
  },
  bottomSection: {
    paddingBottom: 20,
  },
  headerImage: {
    width: "100%",
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30, // Less margin than login, more fields
    color: COLORS.trueBlack,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  // --- Input Styles (from Login) ---
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
  // --- Special Password Input Styles ---
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
    color: COLORS.trueBlack,
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 10,
  },
  // --- Checkbox Styles ---
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.grayText, // Match link text color
  },
  // --- Button Styles (from Login) ---
  button: {
    borderRadius: 30, // Match Login
    paddingVertical: 16, // Match Login
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: COLORS.success, // Use Green for Signup
    marginTop: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.blue, // Lighter shade of success
  },
  // --- Link Styles (from Login) ---
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
  // --- Footer Legal Text ---
  footerText: {
    textAlign: "center",
    lineHeight: 20,
  },
  // --- Error Text (from Login) ---
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});
