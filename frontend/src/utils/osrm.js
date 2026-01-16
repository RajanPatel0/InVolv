export async function fetchRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/driving/\
${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes?.length) throw new Error("No route");

  return {
    geometry: data.routes[0].geometry,
    distance: data.routes[0].distance,
    duration: data.routes[0].duration,
  };
}
