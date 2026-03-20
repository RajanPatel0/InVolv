import { useSearchStore } from "../api/stores/searchStore";

// This function should be called from components after successful login
export const updateAuthStateAfterLogin = async () => {
  const store = useSearchStore.getState(); // Get store instance without hook
  store.checkAuthStatus();
  await store.fetchUserIntents();
};

// Helper to check if user is authenticated (checks if user data exists in localStorage)
export const isUserAuthenticated = () => {
  const user = localStorage.getItem("user");
  return !!(user && user.trim().length > 0);
};

// Helper to logout user
export const logoutUser = async () => {
  // 1. Make logout API call to backend
  try {
    // Call backend logout endpoint (it will clear cookies)
    // For now we'll just return true, the API call happens via Navbar
  } catch (error) {
    console.error("Logout error:", error);
  }

  // 2. Clear all user data from localStorage (keep rememberedUser for UX)
  localStorage.removeItem("user");
  
  // 3. Clear Zustand store
  const store = useSearchStore.getState();
  store.clearUserData();
};