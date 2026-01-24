import { useState, useEffect, useRef } from "react";
import { Search, MapPin } from "lucide-react";

export default function Hero({ onSearch, onDetectLocation, heroRef }) {
  const btnRef = useRef(null);
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(5000); // default 5 km
  const [loading , setLoading] = useState(false);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMove = (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty("--x", `${e.clientX - rect.left}px`);
      btn.style.setProperty("--y", `${e.clientY - rect.top}px`);
    };

    btn.addEventListener("mousemove", handleMove);
    return () => btn.removeEventListener("mousemove", handleMove);
  }, []);

  const handleSearch = async() => {
    if(loading) return; // prevent multiple searches
    setLoading(true);
    try {
      await onSearch({
        productName: query.trim(),
        radius,
      });
    }catch (error) {
      console.error("Search failed:", error);
    }finally{
      setLoading(false);
    }
  };

  const RADIUS_OPTIONS = [
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "25 km", value: 25000 },
    { label: "50 km", value: 50000 },
    { label: "100 km", value: 100000 },
    { label: "250 km", value: 250000 },
    { label: "500 km", value: 500000 },
  ];

  return (
    <section ref={heroRef} className="relative min-h-[80vh] w-full overflow-hidden bg-gradient-to-br from-[#020617] via-[#020617] to-[#064e3b] text-white">

      {/* background glow */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-5 pt-28 text-center">

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          What’s <span className="text-emerald-400">In Stock</span>,
          <br className="hidden sm:block" /> Around You
        </h1>

        {/* Subtext */}
        <p className="mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
          InVolv IN helps you instantly discover nearby stores with real-time availability —
          <span className="text-slate-200"> search, locate, and go.</span>
        </p>

        {/* Search bar */}
        <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/95 px-4 py-3 text-slate-800 shadow-lg">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search products (Electronics, Households…)"
              className="w-full bg-transparent text-sm outline-none sm:text-base"
            />
          </div>

          <div className="relative">
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="h-full cursor-pointer rounded-xl bg-white/95 px-4 py-3
                text-sm font-medium text-slate-700 shadow-lg outline-none
                hover:bg-white sm:text-base"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            ref={btnRef}
            onClick={handleSearch}
            disabled={loading}
            className={`relative overflow-hidden rounded-xl bg-emerald-500 px-6 py-3 font-semibold shadow-xl transition 
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-600 active:scale-95 cursor-pointer"}`}
            style={{
              backgroundImage:
                "radial-gradient(600px circle at var(--x) var(--y), rgba(255,255,255,0.25), transparent 40%)",
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching...
              </span>
            ) : (
              "Search NearBy"
            )}
          </button>
        </div>

        {/* Location CTA */}
        <button
          onClick={onDetectLocation}
          className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <MapPin className="h-4 w-4" />
          Use my current location
        </button>

        {/* Popular categories */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-slate-400">Popular:</span>
          {["Electronics", "Households", "Clothes", "Any Products.."].map(
            (item) => (
              <button
                key={item}
                className="cursor-pointer rounded-full bg-white/10 px-4 py-1.5 text-sm text-slate-200 backdrop-blur transition hover:bg-emerald-500/20 hover:text-white"
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
