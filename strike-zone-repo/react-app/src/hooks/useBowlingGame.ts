'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import type { Bowler, SeasonData, ScoringMode } from '@/lib/types';
import {
  createBowler, MAX_BOWLERS, TEAM_A_ROSTER,
  recalcRunning, getBowlerTotal, getValidRolls,
  isFrameComplete, recalcStreaks,
} from '@/lib/bowling';
import { saveToStorage, loadFromStorage } from '@/lib/storage';

let _nextId = 1;

function freshId() { return _nextId++; }

export function useBowlingGame() {
  const [bowlers, setBowlers] = useState<Bowler[]>([]);
  const [scoringMode, setScoringModeState] = useState<ScoringMode>('frame');
  const [currentWeek, setCurrentWeekState] = useState(1);
  const [seasonData, setSeasonData] = useState<SeasonData>({});
  const [teamAName, setTeamANameState] = useState('GUTTER & SONS');
  const [teamBName, setTeamBNameState] = useState('TEAM B');
  const [gameStarted, setGameStarted] = useState(false);
  const [lockedOrder, setLockedOrder] = useState<number[]>([]);
  const [activeBowlerIdx, setActiveBowlerIdx] = useState(0);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load from storage on mount ──────────────────────────────────────────
  useEffect(() => {
    const data = loadFromStorage();
    if (data.seasonData) setSeasonData(data.seasonData);
    if (data.currentWeek) setCurrentWeekState(data.currentWeek);
    if (data.teamAName)   setTeamANameState(data.teamAName);
    if (data.teamBName)   setTeamBNameState(data.teamBName);
  }, []);

  // ── Toast ───────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  }, []);

  // ── Persist ─────────────────────────────────────────────────────────────
  const persist = useCallback((patch: Partial<{
    seasonData: SeasonData; currentWeek: number;
    teamAName: string; teamBName: string;
  }>) => {
    saveToStorage(patch);
    showToast('Saved');
  }, [showToast]);

  // ── Bowler management ───────────────────────────────────────────────────
  const addBowler = useCallback(() => {
    setBowlers(prev => {
      if (prev.length >= MAX_BOWLERS) { alert('Maximum 6 bowlers per game.'); return prev; }
      return [...prev, createBowler(`BOWLER ${prev.length + 1}`, 'none', freshId())];
    });
  }, []);

  const removeBowler = useCallback((id: number) => {
    setBowlers(prev => prev.filter(b => b.id !== id));
  }, []);

  const renameBowler = useCallback((id: number, name: string) => {
    setBowlers(prev => prev.map(b => b.id === id ? { ...b, name: name.toUpperCase() } : b));
  }, []);

  const setRosterPlayer = useCallback((id: number, name: string) => {
    if (!name) return;
    setBowlers(prev => prev.map(b => b.id === id ? { ...b, name } : b));
  }, []);

  const assignTeam = useCallback((id: number, team: 'a' | 'b' | 'none') => {
    setBowlers(prev => prev.map(b => b.id === id ? { ...b, team } : b));
  }, []);

  const setHandicap = useCallback((id: number, hcp: number) => {
    setBowlers(prev => prev.map(b => b.id === id ? { ...b, handicap: hcp } : b));
  }, []);

  const toggleActive = useCallback((id: number) => {
    setBowlers(prev => prev.map(b => ({ ...b, active: b.id === id ? !b.active : false })));
  }, []);

  const setTeamAName = useCallback((name: string) => {
    setTeamANameState(name);
    persist({ teamAName: name });
  }, [persist]);

  const setTeamBName = useCallback((name: string) => {
    setTeamBNameState(name);
    persist({ teamBName: name });
  }, [persist]);

  // ── Roll recording ──────────────────────────────────────────────────────
  const recordRoll = useCallback((bowlerId: number, pins: number) => {
    setBowlers(prev => {
      const idx = prev.findIndex(b => b.id === bowlerId);
      if (idx === -1) return prev;
      const b = { ...prev[idx], frames: prev[idx].frames.map(f => ({ ...f, rolls: [...f.rolls] })) };
      if (b.currentFrame > 9) return prev;

      const cf = b.currentFrame;
      b.frames[cf].rolls.push(pins);

      if (cf < 9 && pins === 10) { b.consecutiveStrikes++; }
      else if (cf < 9)           { b.consecutiveStrikes = 0; }

      const done = isFrameComplete(b, cf);
      if (done) {
        b.currentFrame = cf < 9 ? cf + 1 : 10;
      }

      const next = [...prev];
      next[idx] = b;
      return next;
    });
  }, []);

  const clearCurrentFrame = useCallback((id: number) => {
    setBowlers(prev => prev.map(b => {
      if (b.id !== id || b.currentFrame > 9) return b;
      const frames = b.frames.map((f, i) =>
        i === b.currentFrame ? { ...f, rolls: [] } : f
      );
      return { ...b, frames, consecutiveStrikes: Math.max(0, b.consecutiveStrikes - 1) };
    }));
  }, []);

  const undoRoll = useCallback((id: number, frameIdx: number, rollIdx: number) => {
    setBowlers(prev => prev.map(b => {
      if (b.id !== id) return b;
      const frames = b.frames.map((f, i) => {
        if (i !== frameIdx) return f;
        const rolls = [...f.rolls];
        rolls.splice(rollIdx, 1);
        return { ...f, rolls };
      });
      // Find current frame
      let newCf = b.currentFrame;
      if (frameIdx <= b.currentFrame && !isFrameComplete({ ...b, frames }, frameIdx)) {
        newCf = frameIdx;
      }
      // Recount streaks
      let streak = 0;
      for (let f = 0; f < 10; f++) {
        if (frames[f].rolls[0] === 10 && f < 9) streak++;
        else streak = 0;
      }
      return { ...b, frames, currentFrame: newCf, consecutiveStrikes: streak };
    }));
  }, []);

  const setEndGameScore = useCallback((id: number, val: string) => {
    const parsed = val === '' || isNaN(Number(val)) ? null : Math.max(0, Math.min(300, parseInt(val)));
    setBowlers(prev => prev.map(b => b.id === id ? { ...b, endGameScore: parsed } : b));
  }, []);

  const resetGame = useCallback(() => {
    if (!confirm('Reset all scores and start a new game?')) return;
    setGameStarted(false);
    setLockedOrder([]);
    setActiveBowlerIdx(0);
    setBowlers(prev => prev.map(b => ({
      ...b,
      frames: Array.from({ length: 10 }, () => ({ rolls: [], score: null })),
      currentFrame: 0,
      consecutiveStrikes: 0,
      endGameScore: null,
      active: false,
    })));
  }, []);

  // ── Scoring mode ────────────────────────────────────────────────────────
  const setScoringMode = useCallback((mode: ScoringMode) => {
    if (mode !== 'frame' && gameStarted) {
      setGameStarted(false);
      setLockedOrder([]);
      setActiveBowlerIdx(0);
      setBowlers(prev => prev.map(b => ({ ...b, active: false })));
    }
    setScoringModeState(mode);
  }, [gameStarted]);

  // ── Week / Season ───────────────────────────────────────────────────────
  const setWeek = useCallback((val: number) => {
    const w = Math.max(1, Math.round(val) || 1);
    setCurrentWeekState(w);
    saveToStorage({ currentWeek: w });
  }, []);

  const changeWeek = useCallback((delta: number) => {
    setCurrentWeekState(prev => {
      const w = Math.max(1, prev + delta);
      saveToStorage({ currentWeek: w });
      return w;
    });
  }, []);

  const saveGameToSeason = useCallback(() => {
    const teamA = bowlers.filter(b => b.team === 'a');
    if (teamA.length === 0) { alert('No Team A bowlers to save.'); return; }
    const completed = scoringMode === 'endgame'
      ? teamA.filter(b => b.endGameScore !== null)
      : teamA.filter(b => b.currentFrame > 9);
    const incomplete = scoringMode === 'endgame'
      ? teamA.filter(b => b.endGameScore === null)
      : teamA.filter(b => b.currentFrame <= 9);

    if (completed.length === 0) {
      const hint = scoringMode === 'endgame'
        ? 'No scores entered yet.'
        : 'No completed games. Finish the game first.';
      alert(hint); return;
    }

    const newSeason = { ...seasonData };
    const saved: string[] = [];
    completed.forEach(b => {
      const score = getBowlerTotal(b, scoringMode);
      if (!newSeason[b.name]) newSeason[b.name] = [];
      const existing = newSeason[b.name].findIndex(g => g.week === currentWeek);
      if (existing >= 0) { newSeason[b.name][existing].score = score; }
      else { newSeason[b.name] = [...newSeason[b.name], { week: currentWeek, score }].sort((a, b2) => a.week - b2.week); }
      saved.push(`${b.name}: ${score}`);
    });

    setSeasonData(newSeason);
    saveToStorage({ seasonData: newSeason });

    const msg = `Week ${currentWeek} saved:\n${saved.join('\n')}` +
      (incomplete.length ? `\n\nNot saved (incomplete): ${incomplete.map(b => b.name).join(', ')}` : '');
    alert(msg);
  }, [bowlers, scoringMode, seasonData, currentWeek]);

  const clearSeasonData = useCallback(() => {
    if (!confirm('Clear all season data? This cannot be undone.')) return;
    setSeasonData({});
    saveToStorage({ seasonData: {} });
  }, []);

  // ── Lock In / Turn management ───────────────────────────────────────────
  const lockGame = useCallback(() => {
    if (scoringMode !== 'frame') return;
    if (gameStarted) {
      setGameStarted(false);
      setLockedOrder([]);
      setActiveBowlerIdx(0);
      setBowlers(prev => prev.map(b => ({ ...b, active: false })));
      return;
    }
    if (bowlers.length === 0) { alert('Add bowlers before locking in.'); return; }
    const order = bowlers.map(b => b.id);
    setLockedOrder(order);
    setActiveBowlerIdx(0);
    setGameStarted(true);
    setBowlers(prev => prev.map(b => ({ ...b, active: b.id === order[0] })));
  }, [scoringMode, gameStarted, bowlers]);

  const advanceActiveBowler = useCallback(() => {
    if (!gameStarted) return;
    setBowlers(prevBowlers => {
      const total = lockedOrder.length;
      let found = false;
      let nextIdx = activeBowlerIdx;
      for (let i = 1; i <= total; i++) {
        const ni = (activeBowlerIdx + i) % total;
        const nb = prevBowlers.find(x => x.id === lockedOrder[ni]);
        if (nb && nb.currentFrame <= 9) { nextIdx = ni; found = true; break; }
      }
      if (!found) {
        setGameStarted(false);
        return prevBowlers.map(b => ({ ...b, active: false }));
      }
      setActiveBowlerIdx(nextIdx);
      return prevBowlers.map(b => ({ ...b, active: b.id === lockedOrder[nextIdx] }));
    });
  }, [gameStarted, lockedOrder, activeBowlerIdx]);

  return {
    // state
    bowlers, scoringMode, currentWeek, seasonData,
    teamAName, teamBName, gameStarted, lockedOrder,
    activeBowlerIdx, toast,
    // actions
    addBowler, removeBowler, renameBowler, setRosterPlayer,
    assignTeam, setHandicap, toggleActive,
    setTeamAName, setTeamBName,
    recordRoll, clearCurrentFrame, undoRoll, setEndGameScore, resetGame,
    setScoringMode, setWeek, changeWeek,
    saveGameToSeason, clearSeasonData,
    lockGame, advanceActiveBowler,
    // helpers (re-exported for convenience in components)
    recalcRunning, getBowlerTotal, getValidRolls, TEAM_A_ROSTER,
  };
}
