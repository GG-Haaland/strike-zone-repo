'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useBowlingGame } from '@/hooks/useBowlingGame';
import { BowlerCard } from '@/components/bowling/BowlerCard';
import { TeamScoreboard } from '@/components/bowling/TeamScoreboard';
import { StreakBar } from '@/components/bowling/StreakBar';
import { PinAnimation, type PinAnimationHandle } from '@/components/bowling/PinAnimation';
import { GameControls } from '@/components/bowling/GameControls';
import { SeasonTracker } from '@/components/bowling/SeasonTracker';
import { MAX_BOWLERS } from '@/lib/bowling';
import Link from 'next/link';

function useClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function TrackerPage() {
  const game = useBowlingGame();
  const pinRef = useRef<PinAnimationHandle>(null);
  const time = useClock();

  // Wire record roll to also trigger pin animation
  const handleRecordRoll = useCallback((bowlerId: number, pins: number) => {
    const bowler = game.bowlers.find(b => b.id === bowlerId);
    if (!bowler) return;
    const cf = bowler.currentFrame;
    const rolls = [...bowler.frames[cf].rolls]; // rolls BEFORE this one
    game.recordRoll(bowlerId, pins);
    pinRef.current?.animate(pins, rolls, cf);
  }, [game]);

  return (
    <div>
      {/* ── STICKY TOP ── */}
      <div id="sticky-top" style={{ position: 'sticky', top: 0, zIndex: 200, background: 'var(--bg)' }}>

        {/* Header */}
        <header>
          <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
            Strike <em>Zone</em>
          </Link>
          <div className="header-right">
            <div className="league-badge">Bowling League Tracker</div>
            <div id="clock">{time}</div>
            <div className="live-indicator">
              <div className="live-dot"></div>Live
            </div>
          </div>
        </header>

        {/* Team Scoreboard */}
        <TeamScoreboard
          bowlers={game.bowlers}
          scoringMode={game.scoringMode}
          teamAName={game.teamAName}
          teamBName={game.teamBName}
          onSetTeamAName={game.setTeamAName}
          onSetTeamBName={game.setTeamBName}
        />

        {/* Lane Animation */}
        {game.scoringMode === 'frame' && <PinAnimation ref={pinRef} />}

        {/* Streak Bar */}
        {game.scoringMode === 'frame' && <StreakBar bowlers={game.bowlers} />}

        {/* Game Controls */}
        <GameControls
          scoringMode={game.scoringMode}
          currentWeek={game.currentWeek}
          gameStarted={game.gameStarted}
          onSetScoringMode={game.setScoringMode}
          onChangeWeek={game.changeWeek}
          onSetWeek={game.setWeek}
          onSaveToSeason={game.saveGameToSeason}
          onReset={game.resetGame}
          onLock={game.lockGame}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">
        <div className="section-header-row">
          <span className="section-title">Bowlers</span>
          <span className="bowler-count-label">
            {game.bowlers.length} / {MAX_BOWLERS}
          </span>
          <button
            className="add-bowler-btn"
            onClick={game.addBowler}
            disabled={game.bowlers.length >= MAX_BOWLERS}
          >+ Add Bowler</button>
        </div>

        <div className="bowlers-grid-wrap" id="bowlers-grid-wrap">
          <div className="bowlers-grid" id="bowlers-grid">
            {game.bowlers.map(b => (
              <BowlerCard
                key={b.id}
                bowler={b}
                scoringMode={game.scoringMode}
                gameStarted={game.gameStarted}
                onRecordRoll={handleRecordRoll}
                onUndoRoll={game.undoRoll}
                onClearFrame={game.clearCurrentFrame}
                onRemove={game.removeBowler}
                onRename={game.renameBowler}
                onRosterSelect={game.setRosterPlayer}
                onAssignTeam={game.assignTeam}
                onSetHandicap={game.setHandicap}
                onToggleActive={game.toggleActive}
                onSetEndGame={game.setEndGameScore}
                onAdvance={game.advanceActiveBowler}
              />
            ))}
            {game.bowlers.length === 0 && (
              <div className="empty-state">
                <p style={{ color: 'var(--muted)', marginBottom: '12px' }}>No bowlers yet — add one to get started.</p>
                <button className="add-bowler-btn" onClick={game.addBowler}>+ Add Bowler</button>
              </div>
            )}
          </div>
        </div>

        {/* Season Tracker */}
        <SeasonTracker seasonData={game.seasonData} onClear={game.clearSeasonData} />
      </div>

      {/* Toast */}
      {game.toast && <div className="storage-toast show">{game.toast}</div>}
    </div>
  );
}
