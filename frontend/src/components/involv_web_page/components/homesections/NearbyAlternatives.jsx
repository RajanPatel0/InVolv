export default function NearbyAlternatives({ stores, selectedStore, onSelect }) {
  if (!selectedStore || stores.length <= 1) return null;

  const alternatives = stores
    .filter(s => s.id !== selectedStore.id)
    .slice(0, 5);

    const formatDistance = (distanceInMeters) => {
    if (distanceInMeters == null) return null;
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} meters`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="mt-12">
      <h3 className="mb-4 text-lg font-semibold">
        Nearby alternatives
      </h3>

      <div className="flex gap-4 overflow-x-auto pb-3">
        {alternatives.map(store => (
          <button
            key={store.id}
            onClick={() => onSelect(store)}
            className="min-w-[260px] rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-400 hover:shadow-md"
          >
            <p className="font-semibold">{store.name}</p>
            <p className="text-sm text-slate-500">
              {formatDistance(store.distance)}  • ₹{store.product.price}
            </p>
            <p className="mt-1 text-sm text-emerald-600">
              {store.stock} in stock
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
