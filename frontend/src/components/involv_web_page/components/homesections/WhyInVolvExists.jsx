import { Truck, AlertTriangle, EyeOff, CheckCircle2, Navigation, Timer } from "lucide-react";

export default function WhyInVolvExists() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#020617] via-[#020617] to-[#022c22] py-15 text-white">
      
      {/* ambient glow */}
      <div className="absolute -top-32 left-1/3 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* heading */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Why <span className="text-emerald-400">InVolv</span> Exists
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Online shopping doesn’t solve urgency.  
            InVolv was built for <span className="text-slate-200">real-world needs, right now.</span>
          </p>
        </div>

        {/* content */}
        <div className="grid gap-10 lg:grid-cols-2">

          {/* PROBLEM */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-red-400/40 hover:bg-white/10">
            <h3 className="mb-6 text-2xl font-semibold text-red-400">
              The Problem Today
            </h3>

            <ul className="space-y-6">
              <ProblemItem
                icon={Truck}
                title="Delivery takes days"
                desc="Urgent needs can’t wait for shipping timelines."
              />
              <ProblemItem
                icon={AlertTriangle}
                title="Stock is uncertain"
                desc="What you order isn’t always what arrives."
              />
              <ProblemItem
                icon={EyeOff}
                title="Local stores are invisible"
                desc="Nearby shops with real stock stay hidden online."
              />
            </ul>
          </div>

          {/* SOLUTION */}
          <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-8 backdrop-blur transition hover:bg-emerald-500/15">
            <h3 className="mb-6 text-2xl font-semibold text-emerald-300">
              The InVolv Solution
            </h3>

            <ul className="space-y-6">
              <SolutionItem
                icon={CheckCircle2}
                title="Real-time store inventory"
                desc="See what’s actually available — no mismatches, no fraud."
              />
              <SolutionItem
                icon={Navigation}
                title="Instant directions"
                desc="Navigate straight to the store that has it."
              />
              <SolutionItem
                icon={Timer}
                title="No waiting. No guessing."
                desc="Get exactly what you want, when you need it."
              />
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}

/* -------- sub components -------- */

function ProblemItem({ icon: Icon, title, desc }) {
  return (
    <li className="group flex items-start gap-4">
      <div className="rounded-xl bg-red-500/10 p-3 transition group-hover:bg-red-500/20">
        <Icon className="h-6 w-6 text-red-400" />
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
      </div>
    </li>
  );
}

function SolutionItem({ icon: Icon, title, desc }) {
  return (
    <li className="group flex items-start gap-4">
      <div className="rounded-xl bg-emerald-400/20 p-3 transition group-hover:bg-emerald-400/30">
        <Icon className="h-6 w-6 text-emerald-300" />
      </div>
      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-emerald-100/80">{desc}</p>
      </div>
    </li>
  );
}
