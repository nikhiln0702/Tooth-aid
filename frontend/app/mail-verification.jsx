import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
  Image,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // Make sure you have @expo/vector-icons installed
import { API_ENDPOINTS } from "../config/api"; 

// Update Colors to match the Screenshot
const COLORS = {
  white: "#FFFFFF",
  trueBlack: "#000000",
  grayText: "#666666",
  placeholder: "#C7C7CD",
  inputBorder: "#EAEAEA",
  otpBoxBackground: "#F7F7F7",
  danger: "#DC3545",
  
  // Specific colors from the image
  darkPurple: "#4A2040", // The "Verify OTP" button color
  tealLink: "#00A86B",   // The "Change the email address" color
  lightPurpleBg: "#F3E5F5", // Optional background accent if needed
};

export default function OtpVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { email } = params;

  // OTP State
  const [otp, setOtp] = useState("");
  const inputRef = useRef(null); // Ref to focus the hidden input
  
  // Logic State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(59); // 59 seconds timer

  // Countdown Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyAndSignup = async () => {
    setError("");
    if (!otp || otp.length < 6) {
      setError("Please enter the full code.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        otp: otp
      };

      console.log("Verifying with:", payload);
      const res = await axios.post(API_ENDPOINTS.VERIFY_MAIL, payload); 

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", "Account verified and created!");
        router.replace("/login"); 
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Verification failed. Invalid code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format time (e.g. 1:59 or 0:59)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          
          {/* Illustration Image */}
          <View style={styles.imageContainer}>
             {/* Replace uri with require('./path/to/your/image.png') */}
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/typing-concept-illustration_114360-399.jpg' }} 
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Enter your{"\n"}Verification code</Text>
          
          <Text style={styles.subtitle}>
            We will send you an One Time Passcode{"\n"}via this <Text style={styles.boldEmail}>{email || "mail@gmail.com"}</Text> email address
          </Text>

          {/* Custom OTP Input Container */}
          <View style={styles.otpWrapper}>
            {/* The Hidden Input (Captures actual typing) */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6} // 6-digit OTP
              autoFocus={true}
              caretHidden={true}
            />

            {/* The Visible Boxes */}
            <Pressable style={styles.otpBoxesContainer} onPress={() => inputRef.current.focus()}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <View 
                  key={index} 
                  style={[
                    styles.otpBox, 
                    otp.length === index && styles.otpBoxActive, // Highlight current box
                    otp.length > index && styles.otpBoxFilled // Style filled box if needed
                  ]}
                >
                  <Text style={styles.otpText}>
                    {otp[index] || ""}
                  </Text>
                </View>
              ))}
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Timer and Resend Row */}
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>Didn't get it? </Text>
            <Pressable disabled={timer > 0} onPress={() => setTimer(59)}>
              <Text style={[styles.resendText, timer > 0 && {color: COLORS.grayText}]}>
                Resend code
              </Text>
            </Pressable>
            <Text style={styles.timerCount}>{formatTime(timer)}</Text>
          </View>

          

          {/* Main Verify Button */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              isLoading && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleVerifyAndSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
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
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: 200,
    height: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    color: COLORS.trueBlack,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  boldEmail: {
    fontWeight: '700',
    color: COLORS.trueBlack,
  },
  
  // --- OTP Styles ---
  otpWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    height: 60, // Ensure height for the hidden input
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0, // Hide the actual input but keep it focusable
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  otpBox: {
    width: 45,
    height: 55,
    borderRadius: 8,
    backgroundColor: COLORS.otpBoxBackground,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for depth like image
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  otpBoxActive: {
    borderWidth: 1.5,
    borderColor: COLORS.trueBlack, // Highlight border when focused
    backgroundColor: COLORS.white,
  },
  otpBoxFilled: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  otpText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.trueBlack,
  },
  
  // --- Timer & Links ---
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  timerText: {
    color: COLORS.grayText,
    fontSize: 14,
  },
  resendText: {
    color: COLORS.trueBlack,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  timerCount: {
    color: COLORS.trueBlack,
    fontWeight: '700',
    marginLeft: 'auto', // Pushes timer to the right
  },
  
  switchAccountContainer: {
    marginBottom: 30,
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
  },
  switchAccountText: {
    color: COLORS.grayText,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  switchAccountLink: {
    color: COLORS.trueBlack,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // --- Buttons ---
  button: {
    width: '90%',
    backgroundColor: COLORS.darkPurple, // Deep purple from image
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#4A2040",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 10,
  },
  bottomLink: {
    padding: 10,
  },
  bottomLinkText: {
    color: COLORS.tealLink, // Green/Teal from image
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: 'underline',
  },
});