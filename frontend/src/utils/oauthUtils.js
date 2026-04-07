import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// User OAuth Login
export const initiateUserGoogleLogin = () => {
  const googleAuthUrl = `${API_BASE_URL}/api/user/auth/google`;
  window.location.href = googleAuthUrl;
};

// Vendor OAuth Login
export const initiateVendorGoogleLogin = () => {
  const googleAuthUrl = `${API_BASE_URL}/api/vendor/auth/google`;
  window.location.href = googleAuthUrl;
};

// Handle OAuth Success (called from OAuthSuccess page)
export const handleOAuthSuccess = async (token, userId, userType = 'user') => {
  // Store token in localStorage
  localStorage.setItem('accessToken', token);
  localStorage.setItem(`${userType}Id`, userId);
  localStorage.setItem('userType', userType);

  // Fetch and store user/vendor profile
  try {
    let profile;
    if (userType === 'vendor') {
      profile = await getVendorProfile(token);
    } else {
      profile = await getUserProfile(token);
    }
    // Store under the appropriate key so axios interceptor can identify user type
    const storageKey = userType === 'vendor' ? 'vendor' : 'user';
    localStorage.setItem(storageKey, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error(`Failed to fetch ${userType} profile after OAuth:`, error);
    // Still consider it success since token is stored, profile fetch may fail due to network
    return true;
  }
};

// Complete Vendor Profile
export const completeVendorProfile = async (profileData, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/vendor/complete-profile`,
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      }
    );

    if (response.data.success) {
      return {
        success: true,
        vendor: response.data.vendor,
        message: response.data.message
      };
    }
  } catch (error) {
    console.error('Error completing vendor profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Check if vendor profile is complete
export const getVendorProfile = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/vendor/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );

    return response.data.vendor;
  } catch (error) {
    console.error('Error fetching vendor profile:', error);
    throw error;
  }
};

// Get User Profile
export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/user/user-profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    );

    return response.data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Clear OAuth session
export const clearOAuthSession = (userType = 'user') => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem(`${userType}Id`);
  localStorage.removeItem('userType');
};

// Get stored token
export const getStoredToken = () => {
  return localStorage.getItem('accessToken');
};

// Check if user is OAuth account
export const isOAuthAccount = (userType = 'user') => {
  return localStorage.getItem('userType') === userType;
};
