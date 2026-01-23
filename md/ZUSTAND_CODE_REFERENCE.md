# 🔧 Zustand Integration - Code Reference

## Store Usage in Components

### Hook-based Selectors (Recommended)

```javascript
import { useSearchStore } from "path/to/searchStore";

// In your component:
const query = useSearchStore((state) => state.query);
const stores = useSearchStore((state) => state.stores);
const selectedStore = useSearchStore((state) => state.selectedStore);
const view = useSearchStore((state) => state.view);
const loading = useSearchStore((state) => state.loading);
const hasSearched = useSearchStore((state) => state.hasSearched);
const userLocation = useSearchStore((state) => state.userLocation);

// Get actions:
const searchProducts = useSearchStore((state) => state.searchProducts);
const selectStore = useSearchStore((state) => state.selectStore);
const setView = useSearchStore((state) => state.setView);
const setUserLocation = useSearchStore((state) => state.setUserLocation);
const clearSearch = useSearchStore((state) => state.clearSearch);
const initializeFromStorage = useSearchStore((state) => state.initializeFromStorage);
```

### Accessing Store Outside Components (if needed)

```javascript
// In utility files or callbacks:
import { useSearchStore } from "path/to/searchStore";

// Get current state
const state = useSearchStore.getState();
console.log(state.query); // "Electronics"

// Call actions
useSearchStore.getState().selectStore(storeObj);
useSearchStore.getState().setView("map");
useSearchStore.getState().clearSearch();

// Subscribe to changes (optional)
const unsubscribe = useSearchStore.subscribe(
  (state) => state.selectedStore,
  (selectedStore) => {
    console.log("Store selected:", selectedStore.name);
  }
);
```

---

## Action Examples

### 1. Search for Products

```javascript
// Triggered from Hero component onSearch callback
const handleSearch = async ({ productName, radius }) => {
  try {
    const loc = userLocation || (await handleDetectLocation());
    if (!loc) return;

    // This action handles:
    // - API call
    // - Data normalization
    // - State update
    // - SessionStorage persistence
    await searchProducts({
      productName,
      lat: loc.lat,
      lng: loc.lng,
      radius,
    });
  } catch (err) {
    console.error("Search failed:", err);
    alert("Unable to search nearby stores");
  }
};
```

### 2. Select a Store

```javascript
// Triggered from StoreCard onClick or Map marker click
const handleSelectStore = (store) => {
  selectStore(store);
  // This will:
  // - Update selectedStore state
  // - Trigger map focus (via MapController component)
  // - Highlight card in list
  // - Show info popup on map
  // - Persist to sessionStorage
};
```

### 3. Change View Mode

```javascript
// Triggered from ViewToggle component
const handleViewChange = (newView) => {
  setView(newView); // "list" | "split" | "map"
  // This will:
  // - Change layout
  // - Show/hide map or list
  // - Persist to sessionStorage
};
```

### 4. Initialize from SessionStorage

```javascript
// Called once on app mount in Home component
useEffect(() => {
  initializeFromStorage();
  // This will:
  // - Check sessionStorage for "involv-search-state"
  // - If exists, restore all state
  // - If not, do nothing (state stays empty)
}, []);
```

### 5. Clear All Search

```javascript
// Optional: when you want to reset everything
const handleClearSearch = () => {
  clearSearch();
  // This will:
  // - Clear all state (query, stores, selectedStore, etc.)
  // - Remove from sessionStorage
  // - Restore to initial state
};
```

---

## Integration Patterns

### Pattern 1: Pass State to Child Components

```javascript
// Parent (Home.jsx)
const stores = useSearchStore((state) => state.stores);
const selectedStore = useSearchStore((state) => state.selectedStore);
const selectStore = useSearchStore((state) => state.selectStore);

// Render and pass as props
<StoreCard
  store={store}
  isSelected={selectedStore?.id === store.id}
  onSelect={selectStore}
/>

// Child (StoreCard.jsx) - no Zustand dependency needed!
export default function StoreCard({ store, isSelected, onSelect }) {
  return (
    <div onClick={() => onSelect(store)} className={isSelected ? "selected" : ""}>
      {store.name}
    </div>
  );
}
```

### Pattern 2: Multiple State Selectors

```javascript
// When you need multiple state values efficiently
const useSearchState = () => {
  const query = useSearchStore((state) => state.query);
  const stores = useSearchStore((state) => state.stores);
  const selectedStore = useSearchStore((state) => state.selectedStore);
  
  // Or as single object (less efficient):
  const state = useSearchStore((state) => ({
    query: state.query,
    stores: state.stores,
    selectedStore: state.selectedStore,
  }));
  
  return state; // or { query, stores, selectedStore }
};

// Usage:
function MyComponent() {
  const { query, stores, selectedStore } = useSearchState();
  // ...
}
```

### Pattern 3: Conditional Rendering Based on State

```javascript
const hasSearched = useSearchStore((state) => state.hasSearched);
const loading = useSearchStore((state) => state.loading);

return (
  <>
    {!hasSearched && (
      <>
        <HowItWorks />
        <Features />
      </>
    )}
    
    {hasSearched && (
      <>
        {loading && <LoadingSpinner />}
        {!loading && <ResultsList />}
      </>
    )}
  </>
);
```

---

## SessionStorage Persistence

### What Gets Saved

```javascript
// When searchProducts completes:
{
  query: "Electronics",
  stores: [
    {
      id: "Store1-0",
      name: "Best Electronics",
      distance: 250,
      // ... other store props
    },
    // ... more stores
  ],
  selectedStore: {
    id: "Store1-0",
    name: "Best Electronics",
    // ...
  },
  view: "split",
  userLocation: {
    lat: 28.6139,
    lng: 77.209
  }
}
```

### When It Gets Saved

1. **After Search**: `searchProducts()` completes successfully
2. **After Store Selection**: `selectStore()` is called
3. **After View Change**: `setView()` is called

### When It Gets Cleared

1. **Manual Clear**: `clearSearch()` is called
2. **Session Timeout**: If user closes all tabs/browser (session storage is tab-specific)

### How to Access It Manually

```javascript
// In browser console:
const saved = JSON.parse(sessionStorage.getItem("involv-search-state"));
console.log(saved); // Full state object

// Restore manually:
sessionStorage.setItem("involv-search-state", JSON.stringify(state));

// Clear manually:
sessionStorage.removeItem("involv-search-state");
```

---

## State Dependencies & Re-renders

### Efficient Selectors (No Unnecessary Re-renders)

```javascript
// ✅ GOOD - Only re-renders when query changes
const query = useSearchStore((state) => state.query);

// ✅ GOOD - Only re-renders when these specific values change
const isLoading = useSearchStore((state) => state.loading);
const storeCount = useSearchStore((state) => state.stores.length);

// ⚠️ LESS EFFICIENT - Re-renders if ANY state changes
const allState = useSearchStore();

// ⚠️ AVOID - Object comparison causes re-renders
const store = useSearchStore((state) => ({
  query: state.query,
  stores: state.stores,
})); // Better to use multiple hooks instead
```

### Dependency Arrays (Don't Needed for Zustand)

```javascript
// OLD WAY (React State):
useEffect(() => {
  // This runs when these dependencies change
}, [query, stores, selectedStore, view, userLocation]);

// NEW WAY (Zustand):
// No dependency arrays needed!
// Zustand handles subscriptions automatically

useEffect(() => {
  // Just do your effect
  const unsubscribe = useSearchStore.subscribe(
    (state) => state.selectedStore,
    (selectedStore) => {
      // Runs when selectedStore changes
      scrollToStore(selectedStore);
    }
  );
  
  return () => unsubscribe();
}, []); // Empty dependency array!
```

---

## Common Patterns in Your App

### Pattern: Hero Component Search

```javascript
// Hero.jsx (unchanged, still props-based)
export default function Hero({ onSearch, onDetectLocation, heroRef }) {
  const handleSearch = () => {
    onSearch({
      productName: query.trim(),
      radius,
    });
  };
}

// Home.jsx (provides callback)
const searchProducts = useSearchStore((state) => state.searchProducts);
const handleSearch = async ({ productName, radius }) => {
  const loc = userLocation || (await handleDetectLocation());
  await searchProducts({ productName, lat: loc.lat, lng: loc.lng, radius });
};

<Hero onSearch={handleSearch} />
```

### Pattern: Store Card Selection

```javascript
// Home.jsx
const selectStore = useSearchStore((state) => state.selectStore);

<StoreCard 
  onSelect={selectStore}
  isSelected={selectedStore?.id === store.id}
/>

// StoreCard.jsx
export default function StoreCard({ onSelect, isSelected, store }) {
  return (
    <div onClick={() => onSelect(store)} className={isSelected ? "selected" : ""}>
      {store.name}
    </div>
  );
}
```

### Pattern: View Toggle

```javascript
// Home.jsx
const view = useSearchStore((state) => state.view);
const setView = useSearchStore((state) => state.setView);

<ViewToggle view={view} setView={setView} />

// ViewToggle.jsx
export default function ViewToggle({ view, setView }) {
  return (
    <>
      <button onClick={() => setView("list")} className={view === "list" ? "active" : ""}>
        List
      </button>
      <button onClick={() => setView("split")} className={view === "split" ? "active" : ""}>
        Split
      </button>
      <button onClick={() => setView("map")} className={view === "map" ? "active" : ""}>
        Map
      </button>
    </>
  );
}
```

---

## Debugging Tips

### 1. Check if State is Initialized

```javascript
// In browser console:
useSearchStore.getState();

// Should show:
// {
//   query: "",
//   stores: [],
//   hasSearched: false,
//   view: "split",
//   selectedStore: null,
//   userLocation: null,
//   loading: false,
//   error: null,
//   ... (actions)
// }
```

### 2. Check SessionStorage After Search

```javascript
// Do a search, then check:
sessionStorage.getItem("involv-search-state");

// Should show populated data
```

### 3. Watch State Changes in Real-time

```javascript
// Add this to component:
useEffect(() => {
  const unsubscribe = useSearchStore.subscribe(
    (state) => state,
    (state) => {
      console.log("Store state updated:", state);
    }
  );
  return () => unsubscribe();
}, []);
```

### 4. Test Persistence

```javascript
// 1. Search for something
// 2. In console: sessionStorage.getItem("involv-search-state")
// 3. Should see populated data
// 4. Refresh page (F5)
// 5. In console: useSearchStore.getState()
// 6. Should still have the data from before refresh
```

### 5. Reset Everything

```javascript
// In browser console:
useSearchStore.getState().clearSearch();
sessionStorage.clear();
location.reload(); // or F5
```

---

## Error Handling

### Search Errors

```javascript
const handleSearch = async ({ productName, radius }) => {
  try {
    const loc = userLocation || (await handleDetectLocation());
    if (!loc) return;

    await searchProducts({
      productName,
      lat: loc.lat,
      lng: loc.lng,
      radius,
    });
  } catch (err) {
    console.error("Search failed:", err);
    // Check error state
    const error = useSearchStore.getState().error;
    alert(`Error: ${error}`);
  }
};
```

### Check Error State

```javascript
const error = useSearchStore((state) => state.error);

{error && <div className="error">{error}</div>}
```

---

## Performance Monitoring

### Track Re-renders

```javascript
useEffect(() => {
  console.log("Home component rendered");
  
  // If using React DevTools Profiler, check:
  // - Why did Home re-render?
  // - Should be only when query/stores/view/selectedStore/loading change
}, [
  useSearchStore((state) => state.query),
  useSearchStore((state) => state.stores.length),
  useSearchStore((state) => state.view),
  useSearchStore((state) => state.selectedStore?.id),
  useSearchStore((state) => state.loading),
]);
```

### Check State Subscription Count

```javascript
// Zustand automatically unsubscribes when component unmounts
// No manual cleanup needed (unlike Redux)

// If you manually subscribe:
useEffect(() => {
  const unsub = useSearchStore.subscribe(...);
  return () => unsub(); // Clean up!
}, []);
```

---

## Migration Checklist

- ✅ Store created with all state properties
- ✅ All actions implemented
- ✅ SessionStorage persistence built-in
- ✅ Home component refactored to use Zustand
- ✅ All child components still receive props (no breaking changes)
- ✅ Scroll-to-selected-store effect working
- ✅ Map focus effect working
- ✅ View toggle persisting
- ✅ Page reload recovery working

---

**Ready to use!** All functionality is working exactly as before, just with Zustand state management.
