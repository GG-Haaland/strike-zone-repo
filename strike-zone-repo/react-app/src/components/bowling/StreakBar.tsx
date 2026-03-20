'use client';
import type { Bowler } from '@/lib/types';

interface Props {
  bowlers: Bowler[];
}

function streakLabel(n: number): string {
  if (n <= 1) return '';
  if (n === 2) return 'Double';
  if (n === 3) return 'Turkey';
  if (n === 4) return 'Four-Bagger';
  if (n === 5) return 'Five-Bagger';
  return `${n}-Bagger`;
}

export function StreakBar({ bowlers }: Props) {
  // Find the bowler with the highest active streak
  const best = bowlers.reduce<Bowler | null>((top, b) =>
    !top || b.consecutiveStrikes > top.consecutiveStrikes ? b : top, null);

  const s = best?.consecutiveStrikes ?? 0;

  return (
    <div className="streak-bar">
      <span className="streak-label">Hot Streak</span>
      <div className="streak-icons" id="streak-icons">
        {s === 0 ? (
          <span style={{ color: 'var(--muted2)', fontSize: '0.62rem', fontFamily: "'Oswald',sans-serif", letterSpacing: '2px' }}>
            — None —
          </span>
        ) : (
          <>
            <span className="streak-name">{best!.name}:</span>
            {Array.from({ length: s }, (_, i) => (
              <span key={i} className="streak-x">X</span>
            ))}
          </>
        )}
      </div>
      <span className="streak-label" id="streak-label-text">
        {s > 1 ? streakLabel(s) : ''}
      </span>
    </div>
  );
}
