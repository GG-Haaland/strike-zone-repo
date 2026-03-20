'use client';
import type { Bowler, ScoringMode } from '@/lib/types';
import { getTeamTotals } from '@/lib/bowling';

interface Props {
  bowlers: Bowler[];
  scoringMode: ScoringMode;
  teamAName: string;
  teamBName: string;
  onSetTeamAName: (name: string) => void;
  onSetTeamBName: (name: string) => void;
}

export function TeamScoreboard({ bowlers, scoringMode, teamAName, teamBName, onSetTeamAName, onSetTeamBName }: Props) {
  const { rawA, rawB, hcpA, hcpB, totalHcpA, totalHcpB } = getTeamTotals(bowlers, scoringMode);
  const diff = Math.abs(totalHcpA - totalHcpB);
  const hcpBadgeA = diff > 0 && totalHcpA > totalHcpB ? `+${diff} HCP` : '';
  const hcpBadgeB = diff > 0 && totalHcpB > totalHcpA ? `+${diff} HCP` : '';

  const maxFrame = bowlers.reduce((m, b) => Math.max(m, b.currentFrame), 0);
  const globalFrame = `Frame ${Math.min(maxFrame + 1, 10)}`;

  return (
    <div className="team-board">
      <div className="team-block team-a">
        <div className="team-label">Team A</div>
        <div className="team-name-row">
          <input
            className="team-name-input"
            value={teamAName}
            maxLength={16}
            onChange={e => onSetTeamAName(e.target.value)}
          />
          {hcpBadgeA && <span className="hcp-diff-badge">{hcpBadgeA}</span>}
        </div>
        <div className="team-score-row">
          <div className="score-main">{hcpA}</div>
          <div className="score-sidebar">
            <div className="score-raw">{rawA}</div>
            <div className="score-label">Raw</div>
          </div>
        </div>
      </div>

      <div className="team-vs">
        <div className="vs-text">VS</div>
        <div className="global-frame" id="global-frame">{globalFrame}</div>
        <div className="bowler-count-badge">
          <span id="bowler-count">{bowlers.length}</span> bowlers
        </div>
      </div>

      <div className="team-block team-b">
        <div className="team-label">Team B</div>
        <div className="team-name-row">
          <input
            className="team-name-input"
            value={teamBName}
            maxLength={16}
            onChange={e => onSetTeamBName(e.target.value)}
          />
          {hcpBadgeB && <span className="hcp-diff-badge">{hcpBadgeB}</span>}
        </div>
        <div className="team-score-row">
          <div className="score-main">{hcpB}</div>
          <div className="score-sidebar">
            <div className="score-raw">{rawB}</div>
            <div className="score-label">Raw</div>
          </div>
        </div>
      </div>
    </div>
  );
}
