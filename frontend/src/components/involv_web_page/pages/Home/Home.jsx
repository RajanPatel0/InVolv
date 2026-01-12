import { useState } from "react";
import Navbar from "../../../Navbar"
import Hero from "../../components/Hero";
import StoreCard from "../../components/search/StoreCard";
import ResultsMap from "../../components/search/ResultsMap";
import ViewToggle from "../../components/search/ViewToggle";
import { dummyStores } from "../../../involv_web_page/data/dummySearchData";

export default function Home() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState("split"); // list | split | map
  const [selectedStore, setSelectedStore] = useState(null);

  const handleSearch = (q) => {
    console.log("SEARCH TRIGGERED:", q);
    setQuery(q);
    setHasSearched(true);
  };


  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <Hero onSearch={handleSearch} />

      {/* RESULTS */}
      {hasSearched && (
        <section className="mx-auto max-w-[90vw] overflow-x-hidden px-4 py-10">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {dummyStores.length} stores found
              </h2>
              <p className="text-slate-400">
                Showing results for{" "}
                <span className="text-emerald-400 font-medium">
                  “{query}”
                </span>
              </p>
            </div>

            <ViewToggle view={view} setView={setView} />
          </div>

          {/* CONTENT */}
          <div
            className={`grid gap-6 ${
              view === "split" ? "lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* LIST */}
            {(view === "list" || view === "split") && (
  <div
    className={`
      ${
        view === "split"
          ? `
            flex gap-4 overflow-x-auto snap-x snap-mandatory
            pb-2 -mx-4 px-4
            lg:grid lg:gap-4 lg:overflow-y-auto lg:mx-0 lg:px-0
            lg:max-h-[650px] lg:max-w-[33vw]
          `
          : "grid grid-cols-1 sm:grid-cols-2 gap-8"
      }
    `}
  >
    {dummyStores.map((store, i) => (
      <div
        key={store.id}
        className={`
          snap-start
          ${view === "split" ? "min-w-[85%] sm:min-w-[60%] lg:min-w-0" : ""}
        `}
      >
        <StoreCard
          store={store}
          index={i}
          variant={view === "list" ? "list" : "rich"}
          onSelect={setSelectedStore}
        />
      </div>
    ))}
  </div>
)}


            {/* MAP */}
            {(view === "map" || view === "split") && (
              <div className={`h-[650px] lg:w-[53vw] sticky top-6 right-0 left-10 lg:ml-8 rounded-2xl border border-slate-200 shadow-lg
              ${view === "map" ? "lg:w-full" : ""}`}>
                <ResultsMap
                  stores={dummyStores}
                  selectedStore={selectedStore}
                  onSelect={setSelectedStore}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
