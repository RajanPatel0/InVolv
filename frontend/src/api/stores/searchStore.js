import { create } from "zustand";
import { searchNearbyProducts } from "../userApi/userApis";

export const useSearchStore = create((set, get) => ({
  query: "",
  location: null,
  nearbyStores: [],
  selectedStore: null,
  hasSearched: false,
  loading: false,
  error: null,

  searchProducts: async ({ productName, lat, lng, radius }) => {
    try {
      set({ loading: true, error: null, hasSearched: true });

      const data = await searchNearbyProducts({
        productName,
        lat,
        lng,
        radius,
      });

      set({
        query: productName,
        location: { lat, lng },
        nearbyStores: data.stores,
        selectedStore: data.stores?.[0] ?? null,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  selectStore: (store) => set({ selectedStore: store }),

  setLocation: (loc) => set({ location: loc }),

  clearSearch: () =>
    set({
      query: "",
      nearbyStores: [],
      selectedStore: null,
      hasSearched: false,
    }),
}));

