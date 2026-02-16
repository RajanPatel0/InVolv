import { useSearchStore } from "../api/stores/searchStore";

// This function should be called from components after successful login
export const updateAuthStateAfterLogin = async () => {
  const store = useSearchStore.getState(); // Get store instance without hook
  store.checkAuthStatus();
  await store.fetchUserIntents();
};

// Helper to check if user is authenticated
export const isUserAuthenticated = () => {
  const token = localStorage.getItem("accessToken");
  return !!(token && token.trim().length > 0);
};