import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

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

/* ---------------- MAIN COMPONENT ---------------- */

export default function ResultsMap({
  stores,
  userLocation,
  selectedStore,
  onSelect,
  onNavigate,
}) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [28.6139, 77.2090]; // Delhi fallback

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
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
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
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-slate-900">
                    {store.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{store.address}</p>

                  {store.product && (
                    <div className="mt-2 rounded-lg bg-emerald-50 p-2">
                      <p className="text-sm font-medium text-emerald-700">
                        {store.product.name}
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        ₹{store.product.price}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => onNavigate?.(store)}
                    className="mt-3 flex w-full items-center justify-center gap-2
                      rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white
                      hover:bg-emerald-600 transition"
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ROUTE LINE */}
        {userLocation && selectedStore && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lng],
              [selectedStore.latitude, selectedStore.longitude],
            ]}
            color="#10B981"
            weight={4}
            opacity={0.8}
            dashArray="10,8"
          />
        )}
      </MapContainer>
    </div>
  );
}
