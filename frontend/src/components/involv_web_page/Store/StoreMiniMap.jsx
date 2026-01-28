import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { ExternalLink, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import RouteLayer from "../components/search/RouteLayer";

/* ---------- ICONS ---------- */

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

/* ---------- COMPONENT ---------- */

export default function StoreMiniMap({ userLoc, storeLoc, eta, distance }) {
  if (!userLoc || !storeLoc) return null;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${storeLoc.lat},${storeLoc.lng}`;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        
        {/* MAP */}
        <div className="relative h-[300px] overflow-hidden rounded-2xl
  border border-neutral-200 dark:border-neutral-800 isolate">
          <MapContainer
            center={[userLoc.lat, userLoc.lng]}
            zoom={14}
            zoomControl={false}
            dragging
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[userLoc.lat, userLoc.lng]} icon={userIcon} />
            <Marker position={[storeLoc.lat, storeLoc.lng]} icon={storeIcon} />

            <RouteLayer
              userLocation={userLoc}
              store={{ location: storeLoc }}
            />
          </MapContainer>
        </div>

        {/* INFO PANEL */}
        <div className="flex flex-col justify-between rounded-2xl
          border border-neutral-200 dark:border-neutral-800
          bg-white dark:bg-neutral-900 p-6">

          <div>
            <h4 className="text-sm font-medium text-neutral-500">
              Route Preview
            </h4>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold">{distance} km</span>
              </div>

              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Approx. {eta} mins travel time
              </p>
            </div>
          </div>

          {/* CTA */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2
              rounded-xl bg-neutral-900 dark:bg-white
              px-4 py-3 text-sm font-semibold
              text-white dark:text-neutral-900
              hover:opacity-90 transition"
          >
            Open in Google Maps
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
