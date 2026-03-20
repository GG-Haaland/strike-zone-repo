export interface Frame {
  rolls: number[];
  score: number | null;
}

export interface Bowler {
  id: number;
  name: string;
  team: 'a' | 'b' | 'none';
  handicap: number;
  active: boolean;
  frames: Frame[];
  currentFrame: number;
  consecutiveStrikes: number;
  endGameScore: number | null;
}

export interface SeasonGame {
  week: number;
  score: number;
}

export type SeasonData = Record<string, SeasonGame[]>;

export type ScoringMode = 'frame' | 'endgame';

export interface GameState {
  bowlers: Bowler[];
  scoringMode: ScoringMode;
  currentWeek: number;
  seasonData: SeasonData;
  teamAName: string;
  teamBName: string;
  gameStarted: boolean;
  lockedOrder: number[];
  activeBowlerIdx: number;
}
