import { useRef, useEffect } from "react";
import Navbar from "../../../Navbar"
import Hero from "../../components/Hero";

import StoreCardSkeleton from "../../components/StoreCardSkeleton";
import MapSkeleton from "../../components/MapSkeleton"

import StoreCard from "../../components/search/StoreCard";
import ResultsMap from "../../components/search/ResultsMap";
import ViewToggle from "../../components/search/ViewToggle";

import { getUserLocation } from "../../../../utils/getUserLocation";
import { useSearchStore } from "../../../../api/stores/searchStore";

import HowItWorks from "../../components/homesections/HowItWorks";
import WhyInVolvExists from "../../components/homesections/WhyInVolvExists";
import TrustAndCTA from "../../components/homesections/TrustAndCTA";
import NearbyAlternatives from "../../components/homesections/NearByAlternatives";
import AreaInsights from "../../components/homesections/AreaInsights";
import SearchFallback from "../../components/homesections/SearchFallback";
import SelectedStoreInsight from "../../components/homesections/SelectedStoreInsight";

export default function Home() {
  const heroRef = useRef(null);
  const cardRefs = useRef({});

  // Zustand store
  const query = useSearchStore((state) => state.query);
  const stores = useSearchStore((state) => state.stores);
  const hasSearched = useSearchStore((state) => state.hasSearched);
  const view = useSearchStore((state) => state.view);
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const userLocation = useSearchStore((state) => state.userLocation);
  const loading = useSearchStore((state) => state.loading);

  // Actions from Zustand
  const searchProducts = useSearchStore((state) => state.searchProducts);
  const selectStore = useSearchStore((state) => state.selectStore);
  const setView = useSearchStore((state) => state.setView);
  const setUserLocation = useSearchStore((state) => state.setUserLocation);
  const initializeFromStorage = useSearchStore((state) => state.initializeFromStorage);

  // Initialize from sessionStorage on mount
  useEffect(() => {
    initializeFromStorage();
  }, []);

  // Scroll to selected store when it changes
  useEffect(() => {
    if (!selectedStore) return;

    const el = cardRefs.current[selectedStore.id];
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [selectedStore]);

  // Detect user location and prompt
  const handleDetectLocation = async () => {
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
      return loc;
    } catch (e) {
      alert("Location access denied");
    }
  };

  // Handle search from Hero component
  const handleSearch = async ({ productName, radius }) => {
    console.log("SEARCH TRIGGERED:", productName);
    try {
      // Get user location if not already set
      const loc = userLocation || (await handleDetectLocation());
      if (!loc) return;

      // Call Zustand search action
      await searchProducts({
        productName,
        lat: loc.lat,
        lng: loc.lng,
        radius,
      });
    } catch (err) {
      console.log("Search Failed:", err);
      alert("Unable to Search Nearby Stores");
    }
  };


  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <Hero 
        heroRef={heroRef}
        onSearch={handleSearch}
        onDetectLocation={handleDetectLocation}
      />

      {!hasSearched && (
        <>
          <HowItWorks />
          <WhyInVolvExists />
          <TrustAndCTA heroRef={heroRef}/>
        </>
      )}

      {/* RESULTS */}
      {hasSearched && (
        <section className="mx-auto max-w-[90vw] overflow-x-hidden px-4 py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {loading ? "Searching nearby stores…" : `${stores.length} stores found`}
              </h2>

              <p className="text-slate-400">
                Showing results for{" "}
                <span className="text-emerald-400 font-medium">
                  “{query}”
                </span>
              </p>
            </div>

            <ViewToggle view={view} setView={setView} />
          </div>

          {/* CONTENT */}
          <div
            className={`grid gap-6 ${
              view === "split" ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* LIST */}
            {(view === "list" || view === "split") && (
              <div
                className={`
                  ${
                    view === "split"
                      ? `
                        flex gap-4 overflow-x-auto snap-x snap-mandatory
                        pb-6 px-2
                        lg:grid lg:gap-4 lg:overflow-y-auto lg:mx-0 lg:px-0
                        lg:max-h-[650px] lg:max-w-[33vw]
                      `
                      : "grid grid-cols-1 sm:grid-cols-2 gap-8"
                  }
                `}
              >
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <StoreCardSkeleton key={i} />
                    ))
                  : stores.map((store, i) => (
                      <div
                        key={store.id}
                        ref={(el) => (cardRefs.current[store.id] = el)}
                        className={`snap-start ${view === "split" ? "min-w-[85%] sm:min-w-[60%] lg:min-w-0" : ""}`}
                      >
                        <StoreCard
                          store={store}
                          index={i}
                          variant={view === "list" ? "list" : "rich"}
                          onSelect={selectStore}
                          onNavigate={selectStore}
                          isSelected={selectedStore?.id === store.id}
                        />
                      </div>
                ))}
              </div>
            )}


            {/* MAP */}
            {(view === "map" || view === "split") && (
              <div className={`h-[650px] lg:w-[53vw] sticky top-6 right-0 left-10 lg:ml-8 rounded-2xl border border-slate-200 shadow-lg
              ${view === "map" ? "lg:w-full" : ""}`}>
                {loading ? (
                  <MapSkeleton />
                ) : (
                  <ResultsMap
                    stores={stores}
                    userLocation={userLocation}
                    selectedStore={selectedStore}
                    onSelect={selectStore}
                    onNavigate={selectStore}
                  />
                )}
              </div>
            )}

          </div>
          {selectedStore && <SelectedStoreInsight store={selectedStore} />}

          <NearbyAlternatives
            stores={stores}
            selectedStore={selectedStore}
            onSelect={selectStore}
          />

          <AreaInsights stores={stores} query={query} />

          <SearchFallback heroRef={heroRef} />

        </section>
      )}
    </div>
  );
}
