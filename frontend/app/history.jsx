// app/history.js
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  Modal, 
  Pressable,
  ActivityIndicator,
  Dimensions,
  RefreshControl, // To add pull-to-refresh
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; // For a consistent layout
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native'; // To fix localhost issue
import { API_ENDPOINTS } from "../config/api"; 
import { ScrollView } from "react-native";


// --- Define a consistent color palette ---
const COLORS = {
  background: "#F8F9FA",
  card: "#FFFFFF",
  text: "#333333",
  subtleText: "#666666",
  primary: "#007BFF",
  border: "#E0E0E0",
  shadow: "#000000",
  overlay: "rgba(0,0,0,0.9)",
  danger: "#DC3545",
};

const { width, height } = Dimensions.get('window');

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // Track the full item for context

  // --- NEW AI STATES ---
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const fetchHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(API_ENDPOINTS.HISTORY, {
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

  const handleOpenImage = (item) => {
    const formattedUri = item.imageUrl.replace('localhost', Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
    setSelectedImage(formattedUri);
    setSelectedItem(item);
    setAiResponse(null); // Reset tips when opening a new image
  };

  const getAiTips = async (retries = 3, delay = 1000) => {
  setIsGeneratingTips(true);
  try {
    // 1. Create a FormData instance
    const formData = new FormData();

    // 2. Append the image from the URL to FormData
    // React Native's FormData requires an object with uri, name, and type for files
    formData.append('dental_image', {
      uri: selectedImage,
      name: 'history_analysis.jpg', // You can name this dynamically
      type: 'image/jpeg',           // Ensure this matches your expected mimeType
    });

    // 3. Optional: Add detection results if you want Gemini to see them
    // formData.append('detectionSummary', selectedItem.diagnosisResult);

    // 4. Send the POST request to your existing /analyze endpoint
    const response = await axios.post(`${API_ENDPOINTS.ANALYZE}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        // Include token if your /analyze route is protected
        // Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
      },
    });

    setAiResponse(response.data);
  } catch (err) {
    console.error("AI Tip Error:", err);
    
    // Exponential backoff for rate limiting
    if (err.response && err.response.status === 429 && retries > 0) {
      console.log(`Rate limit hit. Retrying in ${delay / 1000}s... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return getAiTips(retries - 1, delay * 2); // Double the delay for the next retry
    }
    
    // Handle other errors
  } finally {
    setIsGeneratingTips(false);
  }
};

  // --- Formatter for the date ---
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // --- Delete analysis function ---
  const handleDelete = (item) => {
    Alert.alert(
      "Delete Analysis",
      "Are you sure you want to delete this analysis? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteAnalysis(item._id)
        }
      ]
    );
  };

  const deleteAnalysis = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.delete(API_ENDPOINTS.DELETE_ANALYSIS(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove the item from local state
      setHistory(prevHistory => prevHistory.filter(item => item._id !== id));
    } catch (err) {
      console.error("Error deleting analysis:", err);
      Alert.alert("Error", "Failed to delete analysis. Please try again.");
    }
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
           <Pressable onPress={() => {console.log("IMAGE CLICKED");
           setSelectedImage(item.imageUrl.replace('localhost', Platform.OS === 'android' ? '10.0.2.2' : 'localhost'))}}>
          <Image source={{ uri: item.imageUrl.replace('localhost', Platform.OS === 'android' ? '10.0.2.2' : 'localhost') }} style={styles.image} />
        </Pressable>
            <View style={styles.info}>
              <Text style={styles.result}>{item.diagnosisResult}</Text>
              <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            </View>
            <Pressable 
              style={styles.deleteButton} 
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={22} color={COLORS.danger} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={EmptyListComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedImage(null);
          setAiResponse(null);
        }}
      >
        <View style={styles.modalBackground}>
          <Pressable style={styles.closeButton} onPress={() => {
            setSelectedImage(null);
            setAiResponse(null);
          }}>
            <Ionicons name="close-circle" size={40} color="white" />
          </Pressable>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.fullImage} 
              resizeMode="contain" 
            />

            {/* --- AI TIPS SECTION --- */}
            <View style={styles.aiSection}>
              {!aiResponse ? (
                <Pressable 
                  style={styles.aiButton} 
                  onPress={getAiTips}
                  disabled={isGeneratingTips}
                >
                  {isGeneratingTips ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color="white" />
                      <Text style={styles.aiButtonText}> Tips from AI</Text>
                    </>
                  )}
                </Pressable>
              ) : (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsHeader}>AI Analysis & Tips</Text>
                  {aiResponse.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                  ))}
                  <Text style={styles.disclaimerText}>{aiResponse.disclaimer}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 8, 
    marginRight: 16,
    backgroundColor: COLORS.border, // Placeholder color
  },
  deleteButton: {
    padding: 8,
    marginLeft: 'auto',
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
   modalBackground: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
  modalScrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  aiSection: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
  },
  aiButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 5,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
  },
  tipsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
  tipText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  disclaimerText: {
    fontSize: 12,
    color: COLORS.subtleText,
    fontStyle: 'italic',
    marginTop: 15,
    textAlign: 'center',
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