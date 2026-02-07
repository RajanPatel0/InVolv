import { motion } from "framer-motion";

export default function SkeletonCard() {
  return (
    <motion.div
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4 h-40"
    >
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded-lg bg-slate-700/50" />
        <div className="h-3 w-1/2 rounded-lg bg-slate-700/50" />
        <div className="mt-4 h-12 rounded-lg bg-slate-700/30" />
        <div className="flex gap-2">
          <div className="h-10 flex-1 rounded-lg bg-slate-700/30" />
          <div className="h-10 w-10 rounded-lg bg-slate-700/30" />
        </div>
      </div>
    </motion.div>
  );
}
