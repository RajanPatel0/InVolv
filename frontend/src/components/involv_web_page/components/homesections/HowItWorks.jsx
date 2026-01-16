import { Search, MapPin, IndianRupee, Navigation, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function HowItWorks() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  const steps = [
    {
      icon: <Search className="w-7 h-7" />,
      title: "Search Any Product",
      desc: "Search exactly what you need — no fake listings, no misleading ads.",
    },
    {
      icon: <MapPin className="w-7 h-7" />,
      title: "See Real Nearby Stock",
      desc: "View live availability from real local stores near you.",
    },
    {
      icon: <IndianRupee className="w-7 h-7" />,
      title: "Compare Price & Availability",
      desc: "Compare prices and stock instantly — avoid overpaying or mismatches.",
    },
    {
      icon: <Navigation className="w-7 h-7" />,
      title: "Go Instantly",
      desc: "Get directions to the nearest store and buy with confidence.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#050B14] to-[#071827] py-20">
      <div className="mx-auto max-w-7xl px-6">

        {/* HEADER */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white">
          How <span className="text-emerald-400">InVolv</span> Works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400">
          No delivery scams. No wrong products. Just real nearby stores.
        </p>

        {/* MOBILE CONTROLS */}
        <div className="mt-10 flex justify-between lg:hidden">
          <button onClick={() => scroll("left")} className="rounded-lg border border-white/10 p-2 text-white">
            <ChevronLeft />
          </button>
          <button onClick={() => scroll("right")} className="rounded-lg border border-white/10 p-2 text-white">
            <ChevronRight />
          </button>
        </div>

        {/* CARDS */}
        <div
          ref={scrollRef}
          className="
            mt-6 flex gap-6 overflow-x-auto scroll-smooth
            snap-x snap-mandatory pb-4
            lg:grid lg:grid-cols-4 lg:overflow-visible
          "
        >
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="
                min-w-[260px] snap-start
                lg:min-w-0
                rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur
                transition hover:border-emerald-400/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]
              "
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                {step.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
