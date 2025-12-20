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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // Used for the Lock Icon
import { API_ENDPOINTS } from "../config/api"; // Your API config
import axios from "axios";

// Colors matching the screenshot
const COLORS = {
  white: "#FFFFFF",
  black: "#000000",
  grayText: "#666666",
  inputBorder: "#EAEAEA",
  primaryBlue: "#007AFF", // Standard iOS Blue
  iconYellow: "#FFCC00",  // Lock icon color
  placeholder: "#C7C7CD",
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
    //   API Call Placeholder
      const res = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      
    //   Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        "Check your email",
        "We have sent a OTP to your email.",
        [{ text: "OK", onPress: () => router.push(`/otpVerification?email=${encodeURIComponent(email)}`) }]
      );
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
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
        <View style={styles.contentContainer}>
          
          {/* Lock Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color={COLORS.iconYellow} />
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>
            Enter the email associated with your account.{"\n"}
            We'll send you the reset link.
          </Text>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Reset Password Button (Blue) */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
              isLoading && styles.buttonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Reset Password</Text>
            )}
          </Pressable>

          {/* Back to Sign In Button (White with Border) */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to sign in</Text>
          </Pressable>

        </View>
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
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center", 
    marginTop: -50, // Visual balance
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.black,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.grayText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 24,
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
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: COLORS.primaryBlue,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  secondaryButtonText: {
    color: COLORS.grayText,
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