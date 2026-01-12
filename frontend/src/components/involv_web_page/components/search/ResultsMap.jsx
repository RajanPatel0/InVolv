import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const storeIcon = new L.DivIcon({
  html: `<div class="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function ResultsMap({ stores, userLocation, selectedStore }) {
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [28.6139, 77.209];

  return (
    <MapContainer center={center} zoom={13} className="lg:h-[650px] h-[650px] rounded-xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} />
      )}

      {stores.map((s, i) => (
        <Marker
            key={i}
            position={[s.latitude, s.longitude]}
            icon={storeIcon}
        />
        ))}


      {userLocation && selectedStore && (
        <Polyline
            positions={[
            [userLocation.lat, userLocation.lng],
            [selectedStore.latitude, selectedStore.longitude],
            ]}
            color="#10B981"
        />
        )}

    </MapContainer>
  );
}
