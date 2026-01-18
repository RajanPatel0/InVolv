import React from "react";
import { useEffect } from "react";
import Navbar from "../../../Navbar";
import StoreHero from "../../Store/StoreHero";
import ProductAvailability from "../../Store/ProductAvailability";
import StoreMiniMap from "../../Store/StoreMiniMap";
import StoreActions from "../../Store/StoreActions";
import SimilarStores from "../../Store/SimilarStores";

const StoreDetails = () => {
  const store = {
    id: "store_123",
    name: "Alntend Solutions",
    isOpen: true,
    categories: ["Software", "Electronics"],
  };

  const searchedProduct = {
    id: "prod_456",
    name: "Nearest Store Software",
    price: 80000,
    stock: 50,
    updatedMins: 12,
  };

  const nearbyStores = [
  {
    id: 1,
    name: "TechZone Electronics",
    address: "1.2 km • MG Road",
    distance: 1200,
    openingHours: "10 AM – 9 PM",
    phone: "+91 98765 43210",
    product: {
      name: "Samsung Galaxy S23",
      price: 69999,
      stock: 5,
      productCategory: "electronics",
    },
  },
  {
    id: 2,
    name: "Digital Hub Store",
    address: "900 m • City Center",
    distance: 900,
    openingHours: "9 AM – 10 PM",
    product: {
      name: "iPhone 14",
      price: 79999,
      stock: 3,
      productCategory: "electronics",
    },
  },
  {
    id: 3,
    name: "SmartBuy Retail",
    address: "1.8 km • Ring Road",
    distance: 1800,
    openingHours: "11 AM – 8 PM",
    product: {
      name: "OnePlus 11",
      price: 61999,
      stock: 7,
      productCategory: "electronics",
    },
  },
];

useEffect(() => {
  window.scrollTo({ top: 0, behavior: "instant" });
}, []);


  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* STICKY HERO */}
        <StoreHero store={store} eta={8} distance={2.4} />

        {/* CONTENT BELOW STICKY */}
        <div className="pt-6">
          <ProductAvailability product={searchedProduct} />

          <StoreMiniMap
            userLoc={{ lat: 30.900965, lng: 75.857277 }}
            storeLoc={{ lat: 30.9022, lng: 75.8601 }}
            eta={8}
            distance={2.4}
          />

          {/* 🔥 ACTIONS SECTION */}
          <div className="max-w-7xl mx-auto px-4">
            <StoreActions
              storeId={store.id}
              productId={searchedProduct.id}
            />
          </div>

          <SimilarStores stores={nearbyStores} />

        </div>
      </div>
    </>
  );
};

export default StoreDetails;
