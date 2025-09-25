// AuthLoadingScreen.js
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function AuthLoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log("Checking auth...");
      console.log("Token:", token); // Debugging line
      if (token != null) {
        router.replace("/home"); // navigate to home if token exists
      } else {
        router.replace("/login"); // navigate to login if no token
      }
    };
     setTimeout(checkAuth, 500);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
