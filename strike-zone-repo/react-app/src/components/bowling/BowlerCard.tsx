'use client';
import { useCallback, useEffect } from 'react';
import type { Bowler, ScoringMode } from '@/lib/types';
import { recalcRunning, getBowlerTotal, getValidRolls, TEAM_A_ROSTER } from '@/lib/bowling';

interface Props {
  bowler: Bowler;
  scoringMode: ScoringMode;
  gameStarted: boolean;
  onRecordRoll: (id: number, pins: number) => void;
  onUndoRoll: (id: number, frameIdx: number, rollIdx: number) => void;
  onClearFrame: (id: number) => void;
  onRemove: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onRosterSelect: (id: number, name: string) => void;
  onAssignTeam: (id: number, team: 'a' | 'b' | 'none') => void;
  onSetHandicap: (id: number, hcp: number) => void;
  onToggleActive: (id: number) => void;
  onSetEndGame: (id: number, val: string) => void;
  onAdvance: () => void;
}

export function BowlerCard({
  bowler: b, scoringMode, gameStarted,
  onRecordRoll, onUndoRoll, onClearFrame, onRemove,
  onRename, onRosterSelect, onAssignTeam, onSetHandicap,
  onToggleActive, onSetEndGame, onAdvance,
}: Props) {
  const scores = recalcRunning(b.frames);
  const total = getBowlerTotal(b, scoringMode);
  const hcpTotal = total + parseInt(String(b.handicap || 0));
  const isDone = b.currentFrame > 9;
  const validRolls = getValidRolls(b);
  const cf = b.currentFrame;
  const fr = !isDone ? b.frames[cf]?.rolls ?? [] : [];

  const teamClass = b.team === 'a' ? 'team-a-card' : b.team === 'b' ? 'team-b-card' : '';
  const activeClass = b.active ? 'active-card' : '';

  // Auto-scroll active bowler into view
  useEffect(() => {
    if (b.active) {
      const el = document.getElementById(`bowler-${b.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [b.active, b.id]);

  const handleRoll = useCallback((pins: number) => {
    onRecordRoll(b.id, pins);
    // If game started in frame mode, schedule advance after animation
    if (gameStarted) {
      const frameJustCompleted = (() => {
        const f = b.frames[cf];
        const rolls = [...f.rolls, pins];
        if (cf < 9) return rolls.length === 2 || rolls[0] === 10;
        if (rolls.length < 2) return false;
        if (rolls[0] === 10 || rolls[0] + rolls[1] === 10) return rolls.length === 3;
        return rolls.length === 2;
      })();
      if (frameJustCompleted) setTimeout(onAdvance, 2400);
    }
  }, [b, cf, gameStarted, onRecordRoll, onAdvance]);

  // ── Render roll badge for frames 1–9 ──────────────────────────────────
  const renderRollBadge = (frameIdx: number, rolls: number[]) => {
    if (frameIdx < 9) {
      return (
        <>
          {rolls[0] === 10 ? (
            <div className="roll-badge roll-X" onClick={() => onUndoRoll(b.id, frameIdx, 0)}>X</div>
          ) : rolls[0] !== undefined ? (
            <>
              <div
                className={`roll-badge ${rolls[0] === 0 ? 'roll-gutter' : 'roll-num'}`}
                onClick={() => onUndoRoll(b.id, frameIdx, 0)}
              >{rolls[0] === 0 ? '—' : rolls[0]}</div>
              {rolls[1] !== undefined && (
                rolls[0] + rolls[1] === 10
                  ? <div className="roll-badge roll-spare" onClick={() => onUndoRoll(b.id, frameIdx, 1)}>/</div>
                  : <div
                      className={`roll-badge ${rolls[1] === 0 ? 'roll-gutter' : 'roll-num'}`}
                      onClick={() => onUndoRoll(b.id, frameIdx, 1)}
                    >{rolls[1] === 0 ? '—' : rolls[1]}</div>
              )}
            </>
          ) : null}
        </>
      );
    } else {
      // 10th frame
      return (
        <>
          {rolls.map((r, i) => {
            let badge;
            if (r === 10) {
              badge = <div key={i} className="roll-badge roll-X" onClick={() => onUndoRoll(b.id, 9, i)}>X</div>;
            } else if (i > 0 && rolls[i - 1] !== 10 && rolls[i - 1] + r === 10) {
              badge = <div key={i} className="roll-badge roll-spare" onClick={() => onUndoRoll(b.id, 9, i)}>/</div>;
            } else {
              badge = (
                <div
                  key={i}
                  className={`roll-badge ${r === 0 ? 'roll-gutter' : 'roll-num'}`}
                  onClick={() => onUndoRoll(b.id, 9, i)}
                >{r === 0 ? '—' : r}</div>
              );
            }
            return badge;
          })}
        </>
      );
    }
  };

  // ── Throw buttons ────────────────────────────────────────────────────
  const renderThrowBtns = () => {
    if (isDone) {
      return <span className="complete-status">✓ Game Complete</span>;
    }
    return (
      <>
        <span className="frame-indicator">
          Frame <strong>{cf + 1}</strong> · Roll <strong>{fr.length + 1}</strong>
        </span>
        {validRolls.map(pins => {
          let cls = 'throw-btn';
          let lbl = String(pins);
          if (pins === 10) { cls += ' strike'; lbl = 'X'; }
          else if (pins === 0) { cls += ' gutter-btn'; lbl = 'G'; }
          else {
            let isSpare = false;
            if (cf < 9 && fr.length === 1) {
              isSpare = pins + fr[0] === 10;
            } else if (cf === 9) {
              if (fr.length === 1 && fr[0] < 10) isSpare = pins + fr[0] === 10;
              else if (fr.length === 2 && fr[0] === 10 && fr[1] < 10) isSpare = pins + fr[1] === 10;
            }
            if (isSpare) { cls += ' spare-btn'; lbl = '/'; }
          }
          return (
            <button key={pins} className={cls} onClick={() => handleRoll(pins)}>{lbl}</button>
          );
        })}
        <button className="clear-frame-btn" onClick={() => onClearFrame(b.id)}>↺ Frame</button>
      </>
    );
  };

  const nameField = b.team === 'a' ? (
    <select className="roster-select" value={b.name} onChange={e => onRosterSelect(b.id, e.target.value)}>
      <option value="">— Select Player —</option>
      {TEAM_A_ROSTER.map(n => <option key={n} value={n}>{n}</option>)}
    </select>
  ) : (
    <input
      className="bowler-name-input"
      defaultValue={b.name}
      maxLength={16}
      onBlur={e => onRename(b.id, e.target.value)}
    />
  );

  return (
    <div className={`bowler-card ${teamClass} ${activeClass}`} id={`bowler-${b.id}`}>
      <div className="card-header">
        {nameField}
        <div className="card-controls">
          <select className="team-select" value={b.team} onChange={e => onAssignTeam(b.id, e.target.value as 'a' | 'b' | 'none')}>
            <option value="none">No Team</option>
            <option value="a">Team A</option>
            <option value="b">Team B</option>
          </select>
          <span className="hcp-label">Hcp</span>
          <input
            className="hcp-input" type="number"
            value={b.handicap} min={0} max={300}
            onChange={e => onSetHandicap(b.id, +e.target.value)}
          />
          {!gameStarted
            ? <button className={`active-toggle ${b.active ? 'on' : ''}`} onClick={() => onToggleActive(b.id)}>
                {b.active ? '▶ Up Now' : 'Set Active'}
              </button>
            : b.active
              ? <span className="active-toggle on" style={{ pointerEvents: 'none' }}>▶ Up Now</span>
              : null
          }
          <button className="remove-btn" onClick={() => onRemove(b.id)} title="Remove bowler">✕</button>
        </div>
      </div>

      {scoringMode === 'endgame' ? (
        <div className="endgame-body">
          <div className="endgame-score-wrap">
            <span className="endgame-label">Final Score</span>
            <input
              type="number" className="endgame-score-input"
              value={b.endGameScore !== null ? b.endGameScore : ''}
              min={0} max={300} placeholder="0 – 300"
              onChange={e => onSetEndGame(b.id, e.target.value)}
            />
          </div>
          <div className="endgame-hcp-wrap">
            <span className="endgame-label">Score + Hcp</span>
            <span className="endgame-hcp-val">
              {b.endGameScore !== null ? parseInt(String(b.endGameScore)) + parseInt(String(b.handicap || 0)) : '—'}
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="score-sheet">
            <table className="score-table">
              <thead>
                <tr>
                  {Array.from({ length: 10 }, (_, i) => (
                    <th key={i}>
                      {i + 1}
                      {i === 9 && <><br /><span style={{ fontSize: '0.45rem', fontWeight: 400, color: 'var(--muted2)' }}>10th</span></>}
                    </th>
                  ))}
                  <th className="th-total">Tot</th>
                  <th>+Hcp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Array.from({ length: 10 }, (_, f) => {
                    const score = scores[f];
                    const isCurrent = f === b.currentFrame && b.currentFrame <= 9;
                    const cellClass = [
                      'frame-cell',
                      f === 9 ? 'tenth-frame' : '',
                      score !== null ? 'has-score' : '',
                      isCurrent ? 'current-frame' : '',
                    ].filter(Boolean).join(' ');
                    return (
                      <td key={f} className={cellClass} id={`fc-${b.id}-${f}`}>
                        <div className="cell-rolls">
                          {renderRollBadge(f, b.frames[f].rolls)}
                        </div>
                        <div className="frame-score">{score !== null ? score : ''}</div>
                      </td>
                    );
                  })}
                  <td className="total-cell">{total || ''}</td>
                  <td className="hcp-total-cell">{total ? hcpTotal : ''}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="input-panel">
            <div className="input-row">{renderThrowBtns()}</div>
          </div>
        </>
      )}
    </div>
  );
}
