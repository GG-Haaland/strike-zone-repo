import { SplineSceneBasic } from "@/components/ui/demo"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"

// ─── Mini scorecard ──────────────────────────────────────────────────────────
function FrameCell({
  frame,
  score,
  roll1,
  roll2,
  isStrike,
  isSpare,
  isCurrent,
}: {
  frame: number
  score: number | null
  roll1: string
  roll2?: string
  isStrike?: boolean
  isSpare?: boolean
  isCurrent?: boolean
}) {
  return (
    <div
      className={`flex-1 border-r border-white/10 last:border-r-0 flex flex-col ${
        isCurrent ? "bg-lane-wood/10" : ""
      }`}
    >
      <div className="flex justify-end gap-1 px-1 pt-1 min-h-[22px]">
        {isStrike ? (
          <span className="text-lane-wood font-bold text-xs">X</span>
        ) : (
          <>
            <span className="text-neutral-400 text-[10px]">{roll1}</span>
            {roll2 && (
              <span
                className={`text-[10px] ${isSpare ? "text-lane-wood font-bold" : "text-neutral-400"}`}
              >
                {roll2}
              </span>
            )}
          </>
        )}
      </div>
      <div className="text-center text-white text-xs font-semibold pb-1 min-h-[20px]">
        {score !== null ? score : ""}
      </div>
    </div>
  )
}

// ─── Sample bowler scorecards ─────────────────────────────────────────────────
const DEMO_BOWLERS = [
  {
    name: "RILEY K.",
    total: 212,
    frames: [
      { roll1: "X", isStrike: true, score: 30 },
      { roll1: "7", roll2: "/", isSpare: true, score: 50 },
      { roll1: "X", isStrike: true, score: 80 },
      { roll1: "X", isStrike: true, score: 110 },
      { roll1: "X", isStrike: true, score: 130 },
      { roll1: "7", roll2: "2", score: 139 },
      { roll1: "X", isStrike: true, score: 159 },
      { roll1: "6", roll2: "/", isSpare: true, score: 179 },
      { roll1: "X", isStrike: true, score: 202 },
      { roll1: "X", isStrike: true, score: 212 },
    ],
  },
  {
    name: "SAM T.",
    total: 178,
    frames: [
      { roll1: "8", roll2: "/", isSpare: true, score: 18 },
      { roll1: "X", isStrike: true, score: 46 },
      { roll1: "9", roll2: "0", score: 55 },
      { roll1: "7", roll2: "/", isSpare: true, score: 73 },
      { roll1: "X", isStrike: true, score: 96 },
      { roll1: "6", roll2: "3", score: 105 },
      { roll1: "X", isStrike: true, score: 130 },
      { roll1: "X", isStrike: true, score: 153 },
      { roll1: "7", roll2: "/", isSpare: true, score: 173 },
      { roll1: "5", roll2: null, isCurrent: true, score: null },
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎳</span>
          <span className="font-extrabold tracking-tight text-white text-lg">
            Strike <em className="not-italic text-lane-wood">Zone</em>
          </span>
        </div>
        <span className="text-xs text-neutral-500 uppercase tracking-widest">
          Bowling League Tracker
        </span>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* ── Hero / 3-D card ─────────────────────────────────────────────── */}
        <section>
          <SplineSceneBasic />
        </section>

        {/* ── Live Scorecards ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.3em] text-lane-wood mb-6 font-semibold">
            Live Scorecards · Week 7
          </h2>
          <div className="grid gap-4">
            {DEMO_BOWLERS.map((bowler) => (
              <Card
                key={bowler.name}
                className="border-white/10 bg-black/60 backdrop-blur"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-white tracking-wider text-sm">
                      {bowler.name}
                    </span>
                    <span className="text-lane-wood font-extrabold text-xl">
                      {bowler.total}
                    </span>
                  </div>
                  {/* Frame row */}
                  <div className="flex border border-white/10 rounded overflow-hidden text-center">
                    {bowler.frames.map((f, i) => (
                      <FrameCell
                        key={i}
                        frame={i + 1}
                        score={f.score}
                        roll1={f.roll1}
                        roll2={(f as { roll2?: string | null }).roll2 ?? undefined}
                        isStrike={f.isStrike}
                        isSpare={f.isSpare}
                        isCurrent={(f as { isCurrent?: boolean }).isCurrent}
                      />
                    ))}
                  </div>
                  {/* Frame numbers */}
                  <div className="flex text-center mt-1">
                    {bowler.frames.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 text-[9px] text-neutral-600 font-medium"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Team leaderboard ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              team: "Gutter & Sons",
              score: 390,
              hcp: 420,
              img: "https://images.unsplash.com/photo-1562077772-3bd90403f7f0?w=800&auto=format&fit=crop",
              badge: "Team A",
            },
            {
              team: "Blue Bolts",
              score: 355,
              hcp: 398,
              img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop",
              badge: "Team B",
            },
          ].map((t) => (
            <Card
              key={t.team}
              className="overflow-hidden border-white/10 relative"
            >
              {/* Background image overlay */}
              <div className="absolute inset-0">
                <Image
                  src={t.img}
                  alt={t.team}
                  fill
                  className="object-cover opacity-10"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              </div>

              <CardHeader className="relative z-10">
                <p className="text-[10px] uppercase tracking-widest text-lane-wood font-semibold">
                  {t.badge}
                </p>
                <CardTitle className="text-white">{t.team}</CardTitle>
                <CardDescription>Season Week 7 standings</CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 flex items-end justify-between pb-6">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest">
                    Raw
                  </p>
                  <p className="text-4xl font-extrabold text-white">{t.score}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest">
                    + Hcp
                  </p>
                  <p className="text-4xl font-extrabold text-lane-wood">
                    {t.hcp}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
