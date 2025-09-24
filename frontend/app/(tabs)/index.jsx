import React,{useState} from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {View,Text,TextInput,StyleSheet,Alert,Pressable,ActivityIndicator,KeyboardAvoidingView,Platform,ScrollView,} from "react-native";
import axios from "axios";
import LoginScreen from "./login";

const Stack = createNativeStackNavigator();





function ResultsScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20 }}>Results Screen</Text>
    </View>
  );
}

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* <Stack.Screen name="Upload" component={UploadScreen} /> */}
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
}