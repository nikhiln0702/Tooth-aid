import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; 
import { API_ENDPOINTS } from "../config/api"; // Your API config
import axios from "axios";

// Consistent Color Palette
const COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  grayText: "#666666",
  inputBorder: "#EAEAEA",
  primaryBlue: "#007AFF", // Standard iOS Blue
  iconYellow: "#FFCC00",  // Lock icon color
  placeholder: "#C7C7CD",
};

export default function SetNewPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params; 

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSetNewPassword = async () => {
    // 1. Basic Validation
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      // 2. API Call
      const res = await axios.post(API_ENDPOINTS.RESET_PASSWORD, {email, newPassword: password });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        "Success",
        "Your password has been reset successfully!",
        [{ text: "Login Now", onPress: () => router.push("/login") }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          
          {/* Open Lock Icon */}
          <View style={styles.iconContainer}>
            {/* Using 'lock-open' to signify the reset/unlocking state */}
            <Ionicons name="lock-open" size={48} color={COLORS.iconYellow} />
          </View>

          <Text style={styles.title}>Set new password</Text>
          <Text style={styles.subtitle}>
            Enter a new password for your account
          </Text>

          {/* Password Input 1 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password*</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={COLORS.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Password Input 2 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password*</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor={COLORS.placeholder}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          

          {/* Reset Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleSetNewPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.black,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.grayText,
    textAlign: "center",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 16, // Spacing between inputs
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.grayText,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primaryBlue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    shadowColor: COLORS.primaryBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
    opacity: 0.6,
  },
});