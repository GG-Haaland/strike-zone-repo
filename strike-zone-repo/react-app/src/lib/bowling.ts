import type { Bowler, Frame, ScoringMode } from './types';

export const MAX_BOWLERS = 6;
export const TEAM_A_ROSTER = ['GJ', 'BLAKE', 'STEVE', 'TOM', 'LOGAN', 'NOEL'];

export function createBowler(name = 'BOWLER', team: 'a' | 'b' | 'none' = 'none', id: number): Bowler {
  return {
    id,
    name,
    team,
    handicap: 0,
    active: false,
    frames: Array.from({ length: 10 }, () => ({ rolls: [], score: null })),
    currentFrame: 0,
    consecutiveStrikes: 0,
    endGameScore: null,
  };
}

// ─── SCORE ENGINE ───────────────────────────────────────────────────────────

export function recalcRunning(frames: Frame[]): (number | null)[] {
  const allRolls: number[] = [];
  frames.forEach(f => f.rolls.forEach(r => allRolls.push(r)));

  const raw: (number | null)[] = [];
  let rollIdx = 0;

  for (let f = 0; f < 10; f++) {
    const fr = frames[f].rolls;
    if (!fr.length) { raw.push(null); continue; }

    if (f < 9) {
      if (fr[0] === 10) {
        const b1 = allRolls[rollIdx + 1] ?? null;
        const b2 = allRolls[rollIdx + 2] ?? null;
        if (b1 === null || b2 === null) { raw.push(null); rollIdx += 1; continue; }
        raw.push(10 + b1 + b2);
        rollIdx += 1;
      } else {
        if (fr.length < 2) { raw.push(null); rollIdx += fr.length; continue; }
        if (fr[0] + fr[1] === 10) {
          const b1 = allRolls[rollIdx + 2] ?? null;
          if (b1 === null) { raw.push(null); rollIdx += 2; continue; }
          raw.push(10 + b1);
        } else {
          raw.push(fr[0] + fr[1]);
        }
        rollIdx += 2;
      }
    } else {
      if (fr.length < 2) { raw.push(null); break; }
      raw.push(fr.reduce((a, b) => a + b, 0));
      rollIdx += fr.length;
    }
  }

  // Convert to running totals
  const running: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    if (raw[i] === null) { running.push(null); }
    else { sum += raw[i]!; running.push(sum); }
  }
  return running;
}

export function getBowlerTotal(b: Bowler, scoringMode: ScoringMode): number {
  if (scoringMode === 'endgame') {
    return b.endGameScore !== null ? parseInt(String(b.endGameScore)) : 0;
  }
  const scores = recalcRunning(b.frames);
  for (let i = 9; i >= 0; i--) { if (scores[i] !== null) return scores[i]!; }
  return 0;
}

export function getValidRolls(b: Bowler): number[] {
  const cf = b.currentFrame;
  if (cf > 9) return [];
  const rolls = b.frames[cf].rolls;
  const options: number[] = [];

  if (cf < 9) {
    if (rolls.length === 0) {
      for (let i = 0; i <= 10; i++) options.push(i);
    } else {
      for (let i = 0; i <= 10 - rolls[0]; i++) options.push(i);
    }
  } else {
    if (rolls.length === 0) {
      for (let i = 0; i <= 10; i++) options.push(i);
    } else if (rolls.length === 1) {
      if (rolls[0] === 10) { for (let i = 0; i <= 10; i++) options.push(i); }
      else { for (let i = 0; i <= 10 - rolls[0]; i++) options.push(i); }
    } else if (rolls.length === 2) {
      if (rolls[0] === 10 && rolls[1] === 10) {
        for (let i = 0; i <= 10; i++) options.push(i);
      } else if (rolls[0] === 10 && rolls[1] < 10) {
        for (let i = 0; i <= 10 - rolls[1]; i++) options.push(i);
      } else if (rolls[0] + rolls[1] === 10) {
        for (let i = 0; i <= 10; i++) options.push(i);
      }
    }
  }
  return options;
}

export function isFrameComplete(b: Bowler, frameIdx: number): boolean {
  const f = b.frames[frameIdx];
  if (frameIdx < 9) {
    return f.rolls.length === 2 || f.rolls[0] === 10;
  } else {
    if (f.rolls.length < 2) return false;
    if (f.rolls[0] === 10 || f.rolls[0] + f.rolls[1] === 10) return f.rolls.length === 3;
    return f.rolls.length === 2;
  }
}

export function recalcStreaks(b: Bowler): number {
  let streak = 0;
  for (let f = 0; f < 10; f++) {
    if (b.frames[f].rolls[0] === 10 && f < 9) streak++;
    else streak = 0;
  }
  return streak;
}

export function getTeamTotals(bowlers: Bowler[], scoringMode: ScoringMode) {
  const teamA = bowlers.filter(b => b.team === 'a');
  const teamB = bowlers.filter(b => b.team === 'b');
  const rawA  = teamA.reduce((s, b) => s + getBowlerTotal(b, scoringMode), 0);
  const rawB  = teamB.reduce((s, b) => s + getBowlerTotal(b, scoringMode), 0);
  const hcpA  = teamA.reduce((s, b) => s + getBowlerTotal(b, scoringMode) + parseInt(String(b.handicap || 0)), 0);
  const hcpB  = teamB.reduce((s, b) => s + getBowlerTotal(b, scoringMode) + parseInt(String(b.handicap || 0)), 0);
  const totalHcpA = teamA.reduce((s, b) => s + parseInt(String(b.handicap || 0)), 0);
  const totalHcpB = teamB.reduce((s, b) => s + parseInt(String(b.handicap || 0)), 0);
  return { rawA, rawB, hcpA, hcpB, totalHcpA, totalHcpB };
}
