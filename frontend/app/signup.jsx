import React, { useState, useEffect } from "react";
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
import { API_ENDPOINTS } from "../config/api"; 
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
  isErrorWithCode
} from '@react-native-google-signin/google-signin';
import { Ionicons } from '@expo/vector-icons'; 

// --- STYLESHEET COLORS ---
const COLORS = {
  white: "#FFFFFF",
  trueBlack: "#000000",
  grayText: "#8A8A8E",
  placeholder: "#C7C7CD",
  inputBorder: "#EAEAEA",
  blue: "#005effff", 
  danger: "#DC3545",
  success: "#0800ffff", 
};

export default function SignupScreen() {
  const router = useRouter();
  
  // Input State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI State
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Configure Google Sign-In on Mount
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "654250670060-30n1hf0q6hcsjicalsqqrtirjqmlomgr.apps.googleusercontent.com", 
      offlineAccess: true, 
      forceCodeForRefreshToken: true,
    });
  }, []);

  // 2. The Google Logic
  const handleGoogleSignup = async () => {
    setError("");
    setIsLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        // Get the token and user details
        const { idToken, user } = response.data;
        console.log("Google Sign-In Success:", user.email);

        // 3. Send to YOUR Backend
        await handleBackendGoogleSync(idToken, user);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log("User cancelled the login flow");
            break;
          case statusCodes.IN_PROGRESS:
            Alert.alert("Error", "Sign in is already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert("Error", "Google Play Services not available");
            break;
          default:
            console.error(error);
            Alert.alert("Error", "Google Sign-In failed");
        }
      } else {
        console.error(error);
        Alert.alert("Error", "An unexpected error occurred");
      }
    }
  };

  // 4. Backend Sync Function
  const handleBackendGoogleSync = async (idToken, googleUser) => {
    try {
      const res = await axios.post(API_ENDPOINTS.GOOGLE_LOGIN, {
        token: idToken,
        // You can optionally send name/email if your backend needs it explicitly,
        // but usually the token is enough.
      });

      if (res.status === 200 || res.status === 201) {
        Alert.alert("Success", `Welcome, ${googleUser.name}!`);
        // Navigate to Home directly since Google is already verified
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      console.error("Backend Error:", err);
      setError("Failed to create account with Google.");
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Email/Pass Signup
  const handleSignup = async () => {
    setError("");
    if (isLoading) return;

    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = { name, email, password };
      const res = await axios.post(API_ENDPOINTS.SIGNUP, payload);

      if (res.data?.message || res.status === 201) {
        Alert.alert(
          "Success",
          "Your account has been created successfully! Please verify your email."
        );
        router.push(`/mailVerification?email=${encodeURIComponent(email)}`);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.msg || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
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
            
            {/* Email Input */}
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
              />
            </View>
            
            {/* Password Input */}
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

            {/* Name Input */}
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

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Standard Signup Button */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!isFormValid || isLoading) ? styles.buttonDisabled : styles.signupButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSignup}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </Pressable>
          </View>

          {/* --- Bottom Section --- */}
          <View style={styles.bottomSection}>
            {/* Google Signup Button */}
            <Pressable
             style={({ pressed }) => [
               styles.button,
               styles.socialButton,
               pressed && styles.buttonPressed,
               isLoading && { opacity: 0.5 }
             ]}
             onPress={handleGoogleSignup}
             disabled={isLoading}
            >
              <Image
                source={require("../assets/images/google_logo.png")}
                style={[styles.socialIcon, { width: 20, height: 20 }]}
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>

            {/* Footer Legal Text */}
            <Text style={[styles.linkButtonText, styles.footerText]}>
              By clicking Sign Up, you agree to our
              <Text style={styles.linkTextBold}> User Agreement</Text> and
              <Text style={styles.linkTextBold}> Privacy Policy</Text>.
            </Text>

            {/* Login Link */}
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
    marginTop: 80, // Slightly reduced to fit screen better
  },
  bottomSection: {
    paddingBottom: 20,
  },
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
  button: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  signupButton: {
    backgroundColor: COLORS.success,
    marginTop: 10,
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
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.blue,
  },
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
  footerText: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 10,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },
});