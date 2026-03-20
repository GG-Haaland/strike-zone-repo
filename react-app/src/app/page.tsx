'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SplineScene } from '@/components/ui/splite';
import { Spotlight } from '@/components/ui/spotlight';
import { loadFromStorage } from '@/lib/storage';

function useHeroStats() {
  const [stats, setStats] = useState({ perfects: 0, high: null as number | null, seasonGames: 0 });
  useEffect(() => {
    const data = loadFromStorage();
    const allScores = Object.values(data.seasonData || {}).flatMap(
      (games: { score: number }[]) => games.map(g => g.score)
    );
    setStats({
      perfects: allScores.filter(s => s === 300).length,
      high: allScores.length ? Math.max(...allScores) : null,
      seasonGames: allScores.length,
    });
  }, []);
  return stats;
}

export default function HomePage() {
  const stats = useHeroStats();

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', width: '100%', minHeight: '420px',
        background: '#0e0b07', borderBottom: '1px solid var(--border2)',
        overflow: 'hidden', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 24px',
      }}>
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#c9a227" />

        {/* dot grid bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(201,162,39,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px', zIndex: 0, pointerEvents: 'none',
        }} />

        {/* Card */}
        <div style={{
          position: 'relative', zIndex: 2, width: '100%', maxWidth: '900px',
          display: 'flex', flexDirection: 'row', alignItems: 'center',
          background: 'rgba(30,25,18,0.85)',
          border: '1px solid rgba(201,162,39,0.22)',
          borderRadius: '16px', overflow: 'hidden',
          backdropFilter: 'blur(6px)',
          boxShadow: '0 0 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,162,39,0.12)',
        }}>
          {/* Left */}
          <div style={{ flex: '1 1 50%', padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{
              fontFamily: "'Oswald',sans-serif", fontSize: '0.6rem', fontWeight: 500,
              letterSpacing: '4px', color: 'var(--gold)', textTransform: 'uppercase',
            }}>Strike Zone · Bowling League</span>

            <h1 style={{
              fontFamily: "'Oswald',sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700,
              lineHeight: 1.05, color: 'var(--cream)', letterSpacing: '2px',
            }}>
              Bowl<br />
              <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Perfect.</em>
            </h1>

            <p style={{
              fontFamily: "'Lora',serif", fontSize: '0.82rem',
              color: 'var(--text2)', lineHeight: 1.6, maxWidth: '300px',
            }}>
              Track every frame, every strike, every split. Real-time league scoring built for serious bowlers.
            </p>

            {/* Stat badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {[
                { icon: '🏆', label: 'Perfect Games', value: stats.perfects > 0 ? String(stats.perfects) : '—' },
                { icon: '⚡', label: 'Season High',   value: stats.high !== null ? String(stats.high) : '—' },
                { icon: '🎳', label: 'Games Saved',   value: stats.seasonGames > 0 ? String(stats.seasonGames) : '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.20)',
                  borderRadius: '6px', padding: '6px 12px',
                  fontFamily: "'Oswald',sans-serif", fontSize: '0.7rem',
                  letterSpacing: '1.5px', color: 'var(--text2)',
                }}>
                  <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                  <span>{label} <strong style={{ color: 'var(--gold-light)' }}>{value}</strong></span>
                </div>
              ))}
            </div>

            <Link href="/tracker" style={{
              marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--gold)', color: '#0e0b07',
              fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '0.85rem',
              letterSpacing: '2px', textTransform: 'uppercase',
              padding: '10px 24px', borderRadius: '6px', textDecoration: 'none',
              width: 'fit-content',
            }}>
              Open Tracker →
            </Link>
          </div>

          {/* Right — Spline scene */}
          <div style={{ flex: '0 0 48%', position: 'relative', height: '320px', overflow: 'hidden' }}>
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HlFTv7Jng/scene.splinecode"
              className="w-full h-full"
            />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(90deg, rgba(30,25,18,0.85) 0%, transparent 30%, transparent 70%, rgba(14,11,7,0.6) 100%)',
            }} />
          </div>
        </div>
      </section>

      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: '48px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{
          fontFamily: "'Oswald',sans-serif", fontSize: '1.1rem', fontWeight: 600,
          letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase',
          marginBottom: '24px',
        }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { icon: '🎳', title: 'Live Scoring',    desc: 'Frame-by-frame or end-game mode with auto-calculated strikes and spares.' },
            { icon: '📊', title: 'Season Tracker',  desc: 'Save weekly scores, track averages, season highs, and handicaps.' },
            { icon: '🔒', title: 'Turn Order Lock', desc: 'Lock bowler rotation and auto-advance through each frame in order.' },
            { icon: '⚡', title: 'Team Boards',     desc: 'Live Team A vs B scoreboard with handicap totals and differential.' },
          ].map(card => (
            <Link key={card.title} href="/tracker" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--panel)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '24px', cursor: 'pointer',
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{card.icon}</div>
                <div style={{
                  fontFamily: "'Oswald',sans-serif", fontSize: '0.9rem', fontWeight: 600,
                  letterSpacing: '1px', color: 'var(--cream)', marginBottom: '6px',
                }}>{card.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', lineHeight: 1.5 }}>{card.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
