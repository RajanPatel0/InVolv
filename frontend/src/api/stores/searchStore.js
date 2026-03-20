import { create } from "zustand";
import { searchNearbyProducts } from "../userApi/userApis";
import { normalizeSearchResults } from "../../utils/normalizeSearchResults";
import { getIntent } from "../userApi/myinvolvApis";

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

  //user Auth & intents state
  isAuthenticated: false,
  userIntents: [], //store all user intents
  userIntentIds: [],  //just store id's for quick lookup
  userIntentLoading: false,

  checkAuthStatus: ()=>{
    // Check if user data exists in localStorage (user data is set after successful login)
    const user = localStorage.getItem("user");
    const isAuth = !!(user && user.trim().length > 0);
    set({ isAuthenticated: isAuth});
    return isAuth;
  },

  fetchUserIntents: async()=>{
    try{
      set({ userIntentLoading: true});
      const isAuth = get().checkAuthStatus();

      if(!isAuth){
        set({ userIntents: [], userIntentIds: [], userIntentLoading: false});
        return [];
      }
      
      const response = await getIntent();

      if(response.intents && Array.isArray(response.intents)){
        //creating map of pdtIds - storeIds combinations
        const intentIds = response.intents.map(intent=>
          `${intent.productId._id}-${intent.storeId._id}`
        );

        set({
          userIntents: response.intents,
          userIntentIds: intentIds,
          userIntentLoading: false,
        });
        return response.intents;
      }

      set({ userIntents: [], userIntentIds: [], userIntentLoading: false});
      return [];
    }catch(error){
      console.error("Error fetching intents:", error);
      set({ userIntents:[], userIntentIds: [], userIntentLoading: false});
      return [];
    }
  },

  hasIntentForProduct: (productId, storeId, intentType = null) => {
    const state = get();
    
    if (!state.isAuthenticated || !productId || !storeId) {
      return false;
    }
    
    const comboId = `${productId}-${storeId}`;
    const existsInIds = state.userIntentIds.includes(comboId);
    
    if (!existsInIds) return false;
    
    if (!intentType) return true;
    
    // Check specific intent type
    const foundIntent = state.userIntents.find(intent => 
      intent.productId._id === productId && 
      intent.storeId._id === storeId &&
      intent.intentType === intentType
    );
    
    return !!foundIntent;
  },

  // Actions modifying to fetch intents after search for authenticated users
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

      // Check auth and fetch intents if user is logged in
      const isAuth = get().checkAuthStatus();
      if (isAuth) {
        await get().fetchUserIntents();
      }

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
          isAuthenticated: state.isAuthenticated,
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
        isAuthenticated: state.isAuthenticated,
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

  // Add action to pass selected product to details page
  setSelectedProduct: (productId) => {
    const state = get();
    set({ 
      selectedStore: {
        ...state.selectedStore,
        productId: productId
      }
    });
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
      isAuthenticated: parsed.isAuthenticated || false,
    });

    get().checkAuthStatus();
  },

   // Add logout action
  clearUserData: () => {
    set({
      isAuthenticated: false,
      userIntents: [],
      userIntentIds: []
    });
  },
  
  // Add refresh intents action
  refreshIntents: () => {
    return get().fetchUserIntents();
  },
}));

