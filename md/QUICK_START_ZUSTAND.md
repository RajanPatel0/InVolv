# 🚀 QUICK START GUIDE - Zustand Integration

## What Changed?

Your search feature now uses **Zustand** instead of React hooks for state management.

**The good news:** Everything works exactly the same! No UI changes, same functionality, cleaner code.

---

## Files Modified

1. **`frontend/src/api/stores/searchStore.js`** - Updated with complete Zustand store
2. **`frontend/src/components/involv_web_page/pages/Home/Home.jsx`** - Refactored to use Zustand

---

## How to Use

### In Components

```javascript
import { useSearchStore } from "path/to/searchStore";

export default function MyComponent() {
  // Get state
  const query = useSearchStore((state) => state.query);
  const stores = useSearchStore((state) => state.stores);
  
  // Get actions
  const searchProducts = useSearchStore((state) => state.searchProducts);
  const selectStore = useSearchStore((state) => state.selectStore);
  
  // Use in JSX
  return (
    <>
      <h1>{query}</h1>
      <button onClick={() => selectStore(stores[0])}>Select First</button>
    </>
  );
}
```

---

## Available State & Actions

### State
```javascript
const state = useSearchStore.getState();

// Properties:
state.query            // Current search query (string)
state.stores           // Array of normalized stores
state.selectedStore    // Currently selected store object
state.userLocation     // {lat, lng} of user
state.view            // "list" | "split" | "map"
state.loading         // true while searching
state.error           // Error message if search fails
state.hasSearched     // true if user has searched at least once
```

### Actions
```javascript
const store = useSearchStore.getState();

// Search for products
await store.searchProducts({
  productName: "Electronics",
  lat: 28.6139,
  lng: 77.2090,
  radius: 5000
});

// Select a store (and update map/list)
store.selectStore(storeObject);

// Change view mode
store.setView("map"); // "list" | "split" | "map"

// Set user location
store.setUserLocation({lat: 28.6139, lng: 77.2090});

// Clear all search data
store.clearSearch();

// Load from sessionStorage (called on app start)
store.initializeFromStorage();
```

---

## Common Patterns

### Pattern 1: Search Products
```javascript
const handleSearch = async ({ productName, radius }) => {
  const loc = userLocation || (await getLocation());
  
  await searchProducts({
    productName,
    lat: loc.lat,
    lng: loc.lng,
    radius,
  });
};
```

### Pattern 2: Select Store
```javascript
const handleSelectStore = (store) => {
  selectStore(store);
  // Automatically updates map, list, and sessionStorage
};
```

### Pattern 3: Change View
```javascript
const handleViewChange = (newView) => {
  setView(newView); // Automatically persists to sessionStorage
};
```

### Pattern 4: Initialize on App Load
```javascript
useEffect(() => {
  initializeFromStorage(); // Restores previous search from sessionStorage
}, []);
```

---

## SessionStorage

The store automatically saves/loads from `sessionStorage` using key: `"involv-search-state"`

**Auto-saved when:**
- Search completes
- Store is selected
- View mode changes

**Auto-loaded when:**
- App starts

**Can manually access:**
```javascript
// Get saved state
const saved = JSON.parse(sessionStorage.getItem("involv-search-state"));

// Clear saved state
sessionStorage.removeItem("involv-search-state");
```

---

## No Breaking Changes

✅ All component interfaces unchanged
✅ All props work the same
✅ All styling preserved
✅ All animations work
✅ All API calls work
✅ All features work

---

## Debugging Tips

### Check Current State
```javascript
// Browser console:
useSearchStore.getState()
```

### Watch State Changes
```javascript
// Browser console:
useSearchStore.subscribe(state => state, (state) => {
  console.log("State changed:", state);
});
```

### Reset Everything
```javascript
// Browser console:
useSearchStore.getState().clearSearch();
```

---

## Testing

Just test normally:
1. Search for something ✅
2. See results in list and map ✅
3. Click store cards to select ✅
4. Toggle view modes ✅
5. Refresh page and state recovers ✅

Everything should work exactly as before.

---

## File Locations

```
frontend/
└─ src/
   ├─ api/
   │  └─ stores/
   │     └─ searchStore.js          ← Zustand store
   └─ components/
      └─ involv_web_page/
         └─ pages/
            └─ Home/
               └─ Home.jsx          ← Uses the store
```

---

## Documentation

For more details, see:
- `ZUSTAND_IMPLEMENTATION_SUMMARY.md` - Overview
- `ZUSTAND_CODE_REFERENCE.md` - Code examples
- `ZUSTAND_ARCHITECTURE.md` - System diagrams
- `ZUSTAND_BEFORE_AFTER.md` - Detailed comparison

---

## Ready to Go!

✅ No setup required
✅ No new dependencies
✅ No configuration needed
✅ Works immediately

Just use it like you normally would!

---

**Questions?** Check the documentation files or see the ZUSTAND_CODE_REFERENCE.md for examples.
