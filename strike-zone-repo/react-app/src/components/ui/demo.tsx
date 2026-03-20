'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { Trophy, Zap, Target } from "lucide-react"

// ─── Stat badge displayed in the hero ───────────────────────────────────────
function StatBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
      <div className="text-lane-wood">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
          {label}
        </p>
        <p className="text-white font-bold text-lg leading-none">{value}</p>
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[560px] bg-black/[0.96] relative overflow-hidden border-lane-wood/30">
      {/* Spotlight coming from upper-left, gold-tinted */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#c9a227"
      />

      <div className="flex h-full">
        {/* ── Left: copy + stats ──────────────────────────────────────────── */}
        <div className="flex-1 p-10 relative z-10 flex flex-col justify-center gap-6">
          {/* Eyebrow */}
          <p className="text-xs uppercase tracking-[0.3em] text-lane-wood font-semibold">
            Strike Zone · Bowling Tracker
          </p>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-none bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-500">
            Bowl<br />Perfect.
          </h1>

          {/* Sub-copy */}
          <p className="text-neutral-400 max-w-xs text-sm leading-relaxed">
            Track every frame, every spare, and every&nbsp;
            <span className="text-lane-wood font-semibold">strike</span> with
            real-time scoring, team leaderboards, and animated lane replays.
          </p>

          {/* Stats row */}
          <div className="flex flex-col gap-3 mt-2">
            <StatBadge
              icon={<Trophy size={18} />}
              label="Perfect Games"
              value="12"
            />
            <StatBadge
              icon={<Zap size={18} />}
              label="Season High"
              value="278"
            />
            <StatBadge
              icon={<Target size={18} />}
              label="Strike Rate"
              value="68 %"
            />
          </div>
        </div>

        {/* ── Right: 3-D Spline scene ─────────────────────────────────────── */}
        <div className="flex-1 relative">
          {/*
            Replace the scene URL below with your own Spline bowling scene.
            The URL here renders a generic 3-D interactive scene as a placeholder.
            A great free bowling ball scene to use:
              https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode
          */}
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />

          {/* Subtle vignette so the 3-D blends into the dark card */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>
      </div>
    </Card>
  )
}
