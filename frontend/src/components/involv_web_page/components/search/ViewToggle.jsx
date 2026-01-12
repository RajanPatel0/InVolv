import { List, Map } from "lucide-react";

export default function ViewToggle({ view, setView }) {
  return (
    <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
      {["list", "split", "map"].map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-3 py-1.5 rounded-md text-sm ${
            view === v
              ? "bg-white text-slate-900"
              : "text-slate-300 hover:bg-slate-700"
          }`}
        >
          {v === "list" && <List className="inline w-4 h-4 mr-1" />}
          {v === "map" && <Map className="inline w-4 h-4 mr-1" />}
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </button>
      ))}
    </div>
  );
}
