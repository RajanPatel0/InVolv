import { useState, useRef, useEffect } from "react";
import Navbar from "../../../Navbar"
import Hero from "../../components/Hero";

import StoreCardSkeleton from "../../components/StoreCardSkeleton";
import MapSkeleton from "../../components/MapSkeleton"

import StoreCard from "../../components/search/StoreCard";
import ResultsMap from "../../components/search/ResultsMap";
import ViewToggle from "../../components/search/ViewToggle";

import { searchNearbyProducts } from "../../../../api/userApi/userApis";
import { getUserLocation } from "../../../../utils/getUserLocation";
import { normalizeSearchResults } from "../../../../utils/normalizeSearchResults";

import HowItWorks from "../../components/homesections/HowItWorks";
import WhyInVolvExists from "../../components/homesections/WhyInVolvExists";
import TrustAndCTA from "../../components/homesections/TrustAndCTA";

export default function Home() {
  const heroRef = useRef(null);
  const cardRefs = useRef({});
  const [query, setQuery] = useState("");
  const [stores, setStores] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [view, setView] = useState("split"); // list | split | map
  const [selectedStore, setSelectedStore] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

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


  const handleDetectLocation = async () => {
    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
      return loc;
    } catch (e) {
      alert("Location access denied");
    }
  };

  const handleSearch = async({ productName, radius}) => {
    console.log("SEARCH TRIGGERED:", productName);
    try{
      setLoading(true);
      setQuery(productName);
      setHasSearched(true);

      //getting user location
      const loc = userLocation || (await handleDetectLocation());
      if (!loc) return;

      //calling search api
      const res= await searchNearbyProducts({
        productName,
        lat: loc.lat,
        lng: loc.lng,
        radius,
      });

      //normalizing data
      const normalized = normalizeSearchResults(res.data);
      setStores(normalized);

      //auto select nearest store
      if (normalized.length) {
        setSelectedStore(normalized[0]);
      }
    } catch(err){
      console.log("Search Failed:", err);
      alert("Unable to Search Nearby Stores");
    }finally {
      setLoading(false);
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
                          onSelect={setSelectedStore}
                          onNavigate={setSelectedStore}
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
                    onSelect={setSelectedStore}
                    onNavigate={setSelectedStore}
                  />
                )}
              </div>
            )}

          </div>
        </section>
      )}
    </div>
  );
}
