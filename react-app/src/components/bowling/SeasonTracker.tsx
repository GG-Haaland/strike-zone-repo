'use client';
import type { SeasonData } from '@/lib/types';
import { TEAM_A_ROSTER } from '@/lib/bowling';

interface Props {
  seasonData: SeasonData;
  onClear: () => void;
}

export function SeasonTracker({ seasonData, onClear }: Props) {
  const allNames = Object.keys(seasonData);

  if (allNames.length === 0) {
    return (
      <div className="season-section">
        <div className="season-header-row">
          <span className="season-title">Season Tracker</span>
        </div>
        <div className="season-empty">No games saved yet — bowl a game and click &ldquo;Save to Season&rdquo;</div>
      </div>
    );
  }

  const allWeeks = [...new Set(
    Object.values(seasonData).flatMap(games => games.map(g => g.week))
  )].sort((a, b) => a - b);

  const orderedNames = [
    ...TEAM_A_ROSTER.filter(n => allNames.includes(n)),
    ...allNames.filter(n => !TEAM_A_ROSTER.includes(n)),
  ];

  return (
    <div className="season-section">
      <div className="season-header-row">
        <span className="season-title">Season Tracker</span>
        <button className="clear-season-btn" onClick={onClear}>✕ Clear Season</button>
      </div>
      <div className="season-table-wrap">
        <table className="season-table">
          <thead>
            <tr>
              <th className="col-name">Bowler</th>
              {allWeeks.map(w => <th key={w}>Wk {w}</th>)}
              <th className="col-stat">Avg</th>
              <th className="col-stat">High</th>
              <th className="col-stat">Hcp</th>
            </tr>
          </thead>
          <tbody>
            {orderedNames.map(name => {
              const games = seasonData[name] || [];
              const scoreMap = Object.fromEntries(games.map(g => [g.week, g.score]));
              const scores = games.map(g => g.score);
              const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
              const high = scores.length ? Math.max(...scores) : null;
              const hcp = avg !== null ? Math.max(0, Math.round((200 - avg) * 0.70)) : null;

              return (
                <tr key={name}>
                  <td className="td-name">{name}</td>
                  {allWeeks.map(w => {
                    if (scoreMap[w] === undefined) {
                      return <td key={w} className="td-empty">—</td>;
                    }
                    const isHigh = scoreMap[w] === high && scores.length > 1;
                    return <td key={w} className={`td-score${isHigh ? ' high' : ''}`}>{scoreMap[w]}</td>;
                  })}
                  <td className="td-avg">{avg !== null ? avg : '—'}</td>
                  <td className="td-high">{high !== null ? high : '—'}</td>
                  <td className="td-hcp">{hcp !== null ? hcp : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
