import { Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { fetchRoute } from "../../../../utils/osrm";

export default function RouteLayer({ userLocation, store }) {
  const map = useMap();
  const [route, setRoute] = useState(null);

  useEffect(() => {
    if (!userLocation || !store) return;

    let isMounted = true;

    fetchRoute(userLocation, store.location)
      .then((res) => {
        if (!isMounted) return;

        setRoute(res.geometry.coordinates.map(([lng, lat]) => [lat, lng]));

        // Fit map to route
        map.fitBounds(
          res.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          { padding: [60, 60] }
        );
      })
      .catch(console.error);

    return () => (isMounted = false);
  }, [userLocation, store, map]);

  if (!route) return null;

  return (
    <Polyline
      positions={route}
      pathOptions={{
        color: "red", // sky-400
        weight: 5,
        opacity: 0.9,
      }}
    />
  );
}
