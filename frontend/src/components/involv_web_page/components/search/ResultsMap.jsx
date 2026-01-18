import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

import RouteLayer from "./RouteLayer";

/* ---------------- ICONS ---------------- */

const storeIcon = new L.DivIcon({
  html: `
    <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        viewBox="0 0 24 24">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
        <path d="M2 7h20"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedStoreIcon = new L.DivIcon({
  html: `
    <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center
      shadow-xl border-2 border-white animate-bounce">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none"
        stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        viewBox="0 0 24 24">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
        <path d="M2 7h20"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const userIcon = new L.DivIcon({
  html: `
    <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center
      shadow-lg border-2 border-white">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>
  `,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ---------------- MAP CONTROLLER ---------------- */

function MapController({ center, selectedStore }) {
  const map = useMap();

  useEffect(() => {
    if (selectedStore) {
      map.flyTo(
        [selectedStore.latitude, selectedStore.longitude],
        16,
        { duration: 1.2 }
      );
    } else if (center) {
      map.flyTo(center, 13, { duration: 1 });
    }
  }, [center, selectedStore, map]);

  return null;
}

function ClosePopupOnMapAction() {
  const map = useMap();

  useEffect(() => {
    const close = () => map.closePopup();

    map.on("zoomstart", close);
    map.on("dragstart", close);
    map.on("click", close);

    return () => {
      map.off("zoomstart", close);
      map.off("dragstart", close);
      map.off("click", close);
    };
  }, [map]);

  return null;
}


/* ---------------- MAIN COMPONENT ---------------- */

export default function ResultsMap({
  stores,
  userLocation,
  selectedStore,
  onSelect,
  onNavigate,
}) {
  const [liveUserLocation, setLiveUserLocation] = useState(userLocation);
  const navigate = useNavigate();

  /* REALTIME USER TRACKING */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLiveUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      console.error,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const center = liveUserLocation
    ? [liveUserLocation.lat, liveUserLocation.lng]
    : [28.6139, 77.2090];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={center} selectedStore={selectedStore} />

        {/* USER LOCATION */}
        {liveUserLocation && (
          <Marker
            position={[liveUserLocation.lat, liveUserLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-sm font-medium">Your location</div>
            </Popup>
          </Marker>
        )}

        {/* STORES */}
        {stores.map((store) => {
          const isSelected = selectedStore?.id === store.id;

          return (
            <Marker
              key={store.id}
              position={[store.latitude, store.longitude]}
              icon={isSelected ? selectedStoreIcon : storeIcon}
              eventHandlers={{
                click: () => onSelect?.(store),
              }}
            >
              <Popup
                autoClose
                closeOnClick={false}
                closeButton={false}
                className="store-popup"
              >
                <div className="w-[220px]">
                  {/* Store name */}
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {store.name}
                  </h3>

                  {/* Address */}
                  <p className="mt-0.5 text-xs text-slate-500 truncate">
                    {store.address}
                  </p>

                  {/* Product */}
                  {store.product && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-2 border border-slate-200">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {store.product.name}
                      </p>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-600">
                          ₹{store.product.price}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {store.product.stock} in stock
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={() => navigate("/store-details", {
                      state: {
                        fromSearch: true,
                      },
                    })}
                    className="mt-3 w-full rounded-lg bg-emerald-500 py-2
                      text-xs font-medium text-white hover:bg-emerald-600 transition"
                  >
                    View Store
                  </button>
                </div>
              </Popup>

            </Marker>
          );
        })}

        {/* ROUTE LINE */}
        {liveUserLocation && selectedStore && (
          <RouteLayer
            userLocation={liveUserLocation}
            store={{
              location: {
                lat: selectedStore.latitude,
                lng: selectedStore.longitude,
              },
            }}
          />
        )}
        <ClosePopupOnMapAction />

      </MapContainer>
    </div>
  );
}
