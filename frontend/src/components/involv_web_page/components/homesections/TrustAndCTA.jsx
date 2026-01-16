import {
  CheckCircle2,
  RefreshCcw,
  MapPinned,
  Store,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRef } from "react";

export default function TrustAndCTA({ heroRef }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -260 : 260,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-gradient-to-br from-[#020617] via-[#020617] to-[#022c22] py-20 text-white">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* MOBILE CONTROLS */}
        <div className="mb-6 flex justify-between lg:hidden">
          <button onClick={() => scroll("left")} className="rounded-lg border border-white/10 p-2">
            <ChevronLeft />
          </button>
          <button onClick={() => scroll("right")} className="rounded-lg border border-white/10 p-2">
            <ChevronRight />
          </button>
        </div>

        {/* TRUST CARDS */}
        <div
          ref={scrollRef}
          className="
            flex gap-6 overflow-x-auto snap-x snap-mandatory
            lg:grid lg:grid-cols-4 lg:overflow-visible
          "
        >
          <TrustItem icon={CheckCircle2} title="Real store data" desc="Only verified nearby stores." />
          <TrustItem icon={RefreshCcw} title="Updated frequently" desc="Stock refreshed regularly." />
          <TrustItem icon={MapPinned} title="OpenStreetMap powered" desc="Accurate open mapping." />
          <TrustItem icon={Store} title="Local-first" desc="Supporting nearby businesses." />
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-300">
            Find what’s near you — <span className="text-white">now.</span>
          </p>

          <button
            onClick={() => heroRef?.current?.scrollIntoView({ behavior: "smooth" })}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold
              shadow-xl transition hover:bg-emerald-600 hover:shadow-emerald-500/30 active:scale-95"
          >
            Search Nearby <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function TrustItem({ icon: Icon, title, desc }) {
  return (
    <div
      className="
        min-w-[240px] snap-start
        lg:min-w-0
        rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur
        transition hover:border-emerald-400/40 hover:bg-white/10
      "
    >
      <Icon className="mb-4 h-6 w-6 text-emerald-400" />
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </div>
  );
}
