import type { SeasonData } from './types';

const STORAGE_KEY = 'strikeZone_v1';

export interface StoredData {
  seasonData: SeasonData;
  currentWeek: number;
  teamAName: string;
  teamBName: string;
}

export function saveToStorage(data: Partial<StoredData>): void {
  try {
    const existing = loadFromStorage();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

export function loadFromStorage(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seasonData: {}, currentWeek: 1, teamAName: 'GUTTER & SONS', teamBName: 'TEAM B' };
    return JSON.parse(raw);
  } catch (e) {
    console.warn('localStorage load failed:', e);
    return { seasonData: {}, currentWeek: 1, teamAName: 'GUTTER & SONS', teamBName: 'TEAM B' };
  }
}
