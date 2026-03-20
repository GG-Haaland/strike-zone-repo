# 🎳 Strike Zone — Bowling League Tracker

A real-time bowling league scoring app with two versions:

## Files

### `strike-zone.html`
A fully self-contained, single-file bowling tracker. Open it in any browser — no install, no server, no dependencies.

**Features:**
- Frame-by-frame and end-game scoring modes
- Live team scoreboards with handicap
- Season tracker — save weekly scores and see averages, highs, handicaps
- Streak bar, pin animation, rolling clock
- Interactive 3D Spline bowling ball hero section
- Fully mobile responsive

### `react-app/`
A Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui version with:
- Interactive Spline 3D scene (bowling ball)
- Gold spotlight hero card
- Live scorecard components
- Team leaderboard
- Custom bowling colour tokens (`lane-wood`, `lane-dark`, `lane-pin`)
- `pin-wobble`, `ball-roll`, `score-pop` animations

## Getting Started

### Single-file version
Just open `strike-zone.html` in your browser. That's it.

### React version
```bash
cd react-app
npm install
npm run dev
```
Then open [http://localhost:3000](http://localhost:3000).
