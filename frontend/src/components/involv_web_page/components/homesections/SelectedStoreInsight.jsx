import { MapPin, IndianRupee, PackageCheck, Sparkles } from "lucide-react";

export default function SelectedStoreInsight({ store }) {
  if (!store) return null;

  const formatDistance = (distanceInMeters) => {
    if (distanceInMeters == null) return null;
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} meters`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  };

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center gap-2 text-emerald-700">
        <Sparkles className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Why this store is recommended</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Insight icon={MapPin} label="Closest" value={`${formatDistance(store.distance)}`} />
        <Insight icon={IndianRupee} label="Best price" value={`₹${store.product.price}`} />
        <Insight icon={PackageCheck} label="Stock" value={`${store.product.stock} available`} />
        <Insight icon={Sparkles} label="Match score" value="High" />
      </div>
    </div>
  );
}

function Insight({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-start rounded-xl bg-white p-4 shadow-sm">
      <Icon className="mb-2 h-5 w-5 text-emerald-500" />
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
