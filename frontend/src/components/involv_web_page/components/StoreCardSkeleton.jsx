export default function StoreCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border p-4 bg-slate-100">
      <div className="flex gap-4">
        <div className="h-20 w-20 rounded-xl bg-slate-300" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/2 rounded bg-slate-300" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />

          <div className="h-16 rounded-lg bg-slate-300" />

          <div className="flex gap-3">
            <div className="h-3 w-20 rounded bg-slate-200" />
            <div className="h-3 w-16 rounded bg-slate-200" />
          </div>
        </div>
      </div>

      <div className="mt-4 h-10 rounded-xl bg-slate-300" />
    </div>
  );
}
