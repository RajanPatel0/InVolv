import { TrendingUp, Store, Sparkles, MapPin } from "lucide-react";

export default function AreaInsights({ stores, query }) {
  if (!stores.length) return null;

  return (
    <div className="mt-12 rounded-2xl bg-slate-50 p-6">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        Insights near you
      </h3>

      <ul className="space-y-2 text-sm text-slate-600">
        <li className="flex gap-1"><Sparkles size={18}/> High interest for “{query}” in your area</li>
        <li className="flex gap-1"><Store size={18}/> {stores.length} stores within your selected radius</li>
        <li className="flex gap-1"><MapPin size={18}/> Prices vary slightly — compare before visiting</li>
      </ul>
    </div>
  );
}
