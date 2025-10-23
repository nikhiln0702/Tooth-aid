// app/history.js
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl, // To add pull-to-refresh
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; // For a consistent layout
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native'; // To fix localhost issue

// --- Define a consistent color palette ---
const COLORS = {
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#333333",
  subtleText: "#666666",
  primary: "#007BFF",
  border: "#E0E0E0",
  shadow: "#000000",
};


export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get('http://localhost:5000/api/analysis/history/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sort data by most recent first
      const sortedData = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setHistory(sortedData);
    } catch (err) {
      console.error("Error fetching history:", err);
      // You could add an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- Function for pull-to-refresh ---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, []);

  // --- Formatter for the date ---
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  // --- Component to show when the list is empty ---
  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No History Found</Text>
      <Text style={styles.emptySubtitle}>Perform an analysis on the home screen to see your results here.</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analysis History</Text>
      </View>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.imageUrl.replace('localhost', Platform.OS === 'android' ? '10.0.2.2' : 'localhost') }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.result}>{item.diagnosisResult}</Text>
              <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={EmptyListComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
    </SafeAreaView>
  );
}

// --- New and improved StyleSheet ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    // --- Adding subtle shadow for depth ---
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 16,
    backgroundColor: COLORS.border, // Placeholder color
  },
  info: { 
    flex: 1, 
    justifyContent: "center" 
  },
  result: { 
    fontSize: 18, 
    fontWeight: "600", // Semi-bold for a softer look
    marginBottom: 6, 
    color: COLORS.text,
  },
  timestamp: { 
    fontSize: 14, 
    color: COLORS.subtleText 
  },
  // --- Styles for the empty list component ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.subtleText,
    textAlign: 'center',
  },
});