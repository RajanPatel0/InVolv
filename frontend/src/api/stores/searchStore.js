import { create } from "zustand";
import { searchNearbyProducts } from "../userApi/userApis";
import { normalizeSearchResults } from "../../utils/normalizeSearchResults";

export const useSearchStore = create((set, get) => ({
  // State
  query: "",
  userLocation: null,
  stores: [],
  selectedStore: null,
  hasSearched: false,
  loading: false,
  error: null,
  view: "split", // list | split | map
  storeDetails: null,
  detailsLoading: false,
  detailsError: null,

  // Actions
  searchProducts: async ({ productName, lat, lng, radius }) => {
    try {
      set({ loading: true, error: null, hasSearched: true });

      const res = await searchNearbyProducts({
        productName,
        lat,
        lng,
        radius,
      });

      // Normalize the API response
      const normalized = normalizeSearchResults(res.data);

      set({
        query: productName,
        userLocation: { lat, lng },
        stores: normalized,
        selectedStore: normalized.length > 0 ? normalized[0] : null,
        loading: false,
      });

      // Persist to sessionStorage
      const state = get();
      sessionStorage.setItem(
        "involv-search-state",
        JSON.stringify({
          query: state.query,
          stores: state.stores,
          selectedStore: state.selectedStore,
          view: state.view,
          userLocation: state.userLocation,
        })
      );
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Search Error:", err);
    }
  },

  selectStore: (store) => {
    set({ selectedStore: store });
    // Persist to sessionStorage
    const state = get();
    sessionStorage.setItem(
      "involv-search-state",
      JSON.stringify({
        query: state.query,
        stores: state.stores,
        selectedStore: store,
        view: state.view,
        userLocation: state.userLocation,
      })
    );
  },

  setView: (newView) => {
    set({ view: newView });
    // Persist to sessionStorage
    const state = get();
    sessionStorage.setItem(
      "involv-search-state",
      JSON.stringify({
        query: state.query,
        stores: state.stores,
        selectedStore: state.selectedStore,
        view: newView,
        userLocation: state.userLocation,
      })
    );
  },

  setUserLocation: (loc) => {
    set({ userLocation: loc });
  },

  clearSearch: () => {
    set({
      query: "",
      stores: [],
      selectedStore: null,
      hasSearched: false,
      view: "split",
      userLocation: null,
      storeDetails: null,
    });
    sessionStorage.removeItem("involv-search-state");
  },

  // Store Details Actions
  setStoreDetails: (store) => {
    set({ storeDetails: store });
  },

  clearStoreDetails: () => {
    set({ storeDetails: null });
  },

  // Initialize from sessionStorage
  initializeFromStorage: () => {
    const saved = sessionStorage.getItem("involv-search-state");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    set({
      query: parsed.query,
      stores: parsed.stores,
      selectedStore: parsed.selectedStore,
      view: parsed.view || "split",
      userLocation: parsed.userLocation,
      hasSearched: true,
    });
  },
}));

