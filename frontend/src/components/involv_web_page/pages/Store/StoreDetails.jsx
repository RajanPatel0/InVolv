import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../Navbar";
import StoreHero from "../../Store/StoreHero";
import ProductAvailability from "../../Store/ProductAvailability";
import PriceInsights from "../../Store/PriceInsights";
import StoreMiniMap from "../../Store/StoreMiniMap";
import StoreActions from "../../Store/StoreActions";
import SimilarStores from "../../Store/SimilarStores";
import { useSearchStore } from "../../../../api/stores/searchStore";
import { getStoreDetails } from "../../../../api/userApi/userApis";

const StoreDetails = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const selectedStore = useSearchStore((state) => state.selectedStore);
  const userLocation = useSearchStore((state) => state.userLocation);
  const query = useSearchStore((state) => state.query);
  const setStoreDetails = useSearchStore((state) => state.setStoreDetails);

  const [storeData, setStoreData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const scrollToMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ 
        behavior: "smooth", 
        block: "start" 
      });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // If no selectedStore, redirect back
    if (!selectedStore || !userLocation) {
      navigate(-1);
      return;
    }

    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const response = await getStoreDetails({
          storeName: selectedStore.name,
          lat: userLocation.lat,
          lng: userLocation.lng,
          productName: query,
        });

        if (response.success) {
          const { mainStore, nearbyAlternatives } = response.data;
          setStoreData(mainStore);
          setNearbyStores(nearbyAlternatives);

          // Use productId from selectedStore if available, otherwise find matching product
          let productToSelect = null;
          
          if (selectedStore.productId) {
            // If we have a specific productId, use it
            productToSelect = mainStore.products.find(
              (p) => p.id === selectedStore.productId
            );
          }
          
          // If no productId or product not found, try to find by name
          if (!productToSelect && query) {
            productToSelect = mainStore.products.find(
              (p) => p.name.toLowerCase().includes(query.toLowerCase())
            );
          }
          
          // If still nothing, use the first product
          if (!productToSelect) {
            productToSelect = mainStore.products[0] || null;
          }
          
          setSelectedProduct(productToSelect);

          // Store in Zustand for reference
          setStoreDetails({
            ...mainStore,
            location: mainStore.location,
            selectedProductId: productToSelect?.id,
          });
        } else {
          setError(response.message || "Failed to load store details");
        }
      } catch (err) {
        console.error("Error fetching store details:", err);
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [selectedStore, userLocation, query, navigate, setStoreDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navbar />
        <main className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-20 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading store details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !storeData) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <Navbar />
        <main className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-20 pb-20 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 font-semibold">{error || "Store not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Navbar />

      {/* Main Layout Container */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-15 pb-15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
          {/* LEFT SIDEBAR: Store Hero (Fixed on Desktop) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24">
            <StoreHero
              store={{
                id: storeData.id,
                name: storeData.name,
                isOpen: storeData.isOpen,
                categories: [storeData.category],
              }}
              eta={Math.ceil((selectedStore.distance / 1000 / 40) * 60)} // Rough ETA calculation
              distance={selectedStore.distance / 1000}
              phone={storeData.phone}
              address={storeData.address}
              onGetDirections={scrollToMap}
            />
          </aside>

          {/* RIGHT CONTENT: Scrollable Details */}
          <div className="lg:col-span-9 space-y-8">
            {selectedProduct && (
              <section id="availability">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                    Product Availability
                  </h2>
                </div>
                <ProductAvailability product={selectedProduct} />
              </section>
            )}

            {selectedProduct && (
              <section id="insights">
                <PriceInsights currentPrice={selectedProduct.price} />
              </section>
            )}

            <section id="location" ref={mapRef} className="scroll-mt-24">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Store Location
                </h2>
                <p className="text-sm text-neutral-500">
                  Fastest route from your current position
                </p>
              </div>
              <StoreMiniMap
                userLoc={userLocation}
                storeLoc={{
                  lat: storeData.location.coordinates[1],
                  lng: storeData.location.coordinates[0],
                }}
                eta={Math.ceil((selectedStore.distance / 1000 / 40) * 60)}
                distance={selectedStore.distance / 1000}
              />
            </section>

            <section id="actions">
              <StoreActions
                storeId={storeData.id}
                productId={selectedProduct?.id}
              />
            </section>

            {nearbyStores && nearbyStores.length > 0 && (
              <section id="similar">
                <SimilarStores stores={nearbyStores} />
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoreDetails;