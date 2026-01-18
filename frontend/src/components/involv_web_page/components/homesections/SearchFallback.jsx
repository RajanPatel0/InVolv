import { useRef } from "react";
export default function SearchFallback({ heroRef }) {
  const scrollRef = useRef(null);
  
    const scroll = (dir) => {
      scrollRef.current?.scrollBy({
        left: dir === "left" ? -260 : 260,
        behavior: "smooth",
      });
    };
  return (
    <div className="mt-14 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
      <h3 className="text-lg font-semibold">Didn’t find what you need?</h3>

      <div onClick={() => heroRef?.current?.scrollIntoView({ behavior: "smooth" })} className="mt-4 flex flex-wrap justify-center gap-3">
        <button className="rounded-lg border px-4 py-2 hover:bg-slate-50">
          Increase radius
        </button>
        <button className="rounded-lg border px-4 py-2 hover:bg-slate-50">
          Try similar products
        </button>
        <button className="rounded-lg border px-4 py-2 hover:bg-slate-50">
          Request this product
        </button>
      </div>
    </div>
  );
}
