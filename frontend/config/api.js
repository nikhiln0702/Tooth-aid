import { Platform } from 'react-native';

// Get the correct API base URL based on platform
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    // For Android physical device, use your computer's IP address
    return 'https://tooth-aid.onrender.com';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, localhost works fine
    return 'https://tooth-aid.onrender.com';
  } else {
    // For web or physical device, use your computer's IP address
    return 'https://tooth-aid.onrender.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API base URL for debugging
console.log('API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  SOCKET: `${API_BASE_URL}`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google-login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  VERIFY_MAIL: `${API_BASE_URL}/api/auth/verify-mail`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  UPLOAD: `${API_BASE_URL}/api/analysis/upload`,
  HISTORY: `${API_BASE_URL}/api/analysis/history`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
};
//android :654250670060-lj8ehlprjagjq8bjusgfcgcihm8rts9b.apps.googleusercontent.com
//ios: 654250670060-kmp0u9b4c27c9o5gj2ahb8f1gjg2im2b.apps.googleusercontent.com
//web: 654250670060-30n1hf0q6hcsjicalsqqrtirjqmlomgr.apps.googleusercontent.com