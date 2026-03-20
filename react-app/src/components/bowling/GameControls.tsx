'use client';
import { useState } from 'react';
import type { ScoringMode } from '@/lib/types';

interface Props {
  scoringMode: ScoringMode;
  currentWeek: number;
  gameStarted: boolean;
  onSetScoringMode: (mode: ScoringMode) => void;
  onChangeWeek: (delta: number) => void;
  onSetWeek: (val: number) => void;
  onSaveToSeason: () => void;
  onReset: () => void;
  onLock: () => void;
}

export function GameControls({
  scoringMode, currentWeek, gameStarted,
  onSetScoringMode, onChangeWeek, onSetWeek,
  onSaveToSeason, onReset, onLock,
}: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="controls-section">
      <div className="controls-header-row">
        <span className="controls-header-label">Game Setup</span>
        <button className="section-toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? '▲ Hide' : '▼ Show'}
        </button>
      </div>
      <div className={`controls-wrap${open ? '' : ' collapsed'}`} style={open ? undefined : { maxHeight: 0, overflow: 'hidden' }}>
        <div className="game-controls">
          <div className="mode-toggle">
            <button
              className={`mode-btn${scoringMode === 'frame' ? ' active' : ''}`}
              onClick={() => onSetScoringMode('frame')}
            >Frame by Frame</button>
            <button
              className={`mode-btn${scoringMode === 'endgame' ? ' active' : ''}`}
              onClick={() => onSetScoringMode('endgame')}
            >End Game</button>
          </div>
          <div style={{ width: '1px', height: '22px', background: 'var(--border2)', margin: '0 4px' }}></div>
          <div className="week-control">
            <span className="week-label">Week</span>
            <button className="week-btn" onClick={() => onChangeWeek(-1)}>◀</button>
            <input
              type="number" className="week-num"
              value={currentWeek} min={1} max={40}
              onChange={e => onSetWeek(+e.target.value)}
            />
            <button className="week-btn" onClick={() => onChangeWeek(1)}>▶</button>
          </div>
          <button className="save-season-btn" onClick={onSaveToSeason}>✓ Save to Season</button>
        </div>
        <div className="lock-in-wrap visible" id="lock-in-wrap" style={{ display: scoringMode === 'frame' ? 'flex' : 'none' }}>
          <button
            className={`lock-in-btn${gameStarted ? ' locked' : ''}`}
            id="lock-in-btn"
            onClick={onLock}
          >
            {gameStarted ? '🔓 Unlock' : '🔒 Lock In Order'}
          </button>
          <button className="reset-btn" onClick={onReset}>↺ New Game</button>
        </div>
      </div>
    </div>
  );
}
