import { Platform } from 'react-native';

// Get the correct API base URL based on platform
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android device/emulator, use your computer's IP address
    return 'http://localhost:5000';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost works fine
    return 'http://localhost:5000';
  } else {
    // For web or physical device, use your computer's IP address
    return 'http://192.168.70.182:5000';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  UPLOAD: `${API_BASE_URL}/api/analysis/upload`,
  HISTORY: `${API_BASE_URL}/api/analysis/history`,
};