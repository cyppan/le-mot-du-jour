import type { Attempt, LetterStatus } from '../types/game';
import { getDailyWordNumber } from './wordList';

const DAILY_STORAGE_KEY = 'tusmo_game_state';
const FREE_STORAGE_KEY = 'tusmo_free_mode_state';
const STREAK_STORAGE_KEY = 'tusmo_streak';

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastWonDay: number;
}

export interface PersistedState {
  dayNumber: number;
  attempts: Attempt[];
  keyStates: Record<string, LetterStatus>;
  isComplete: boolean;
  isWon: boolean;
  currentAttempt: string;
}

export interface FreeModePersistedState {
  targetWord: string;
  attempts: Attempt[];
  keyStates: Record<string, LetterStatus>;
  isComplete: boolean;
  isWon: boolean;
  currentAttempt: string;
}

/**
 * Save daily game state to localStorage
 */
export function saveGameState(state: PersistedState): void {
  try {
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Load daily game state from localStorage
 * Returns null if no saved state or if it's a new day
 */
export function loadGameState(): PersistedState | null {
  try {
    const data = localStorage.getItem(DAILY_STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as PersistedState;

    // Check if it's a new day - if so, return null to start fresh
    if (parsed.dayNumber !== getDailyWordNumber()) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clear daily game state from localStorage
 */
export function clearGameState(): void {
  try {
    localStorage.removeItem(DAILY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}

/**
 * Save free mode game state to localStorage
 */
export function saveFreeModeState(state: FreeModePersistedState): void {
  try {
    localStorage.setItem(FREE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save free mode state:', error);
  }
}

/**
 * Load free mode game state from localStorage
 * Returns null if no saved state
 */
export function loadFreeModeState(): FreeModePersistedState | null {
  try {
    const data = localStorage.getItem(FREE_STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data) as FreeModePersistedState;
  } catch (error) {
    console.error('Failed to load free mode state:', error);
    return null;
  }
}

/**
 * Clear free mode state from localStorage
 */
export function clearFreeModeState(): void {
  try {
    localStorage.removeItem(FREE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear free mode state:', error);
  }
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  maxStreak: 0,
  lastWonDay: 0,
};

/**
 * Load streak data from localStorage
 */
export function loadStreakData(): StreakData {
  try {
    const data = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!data) return DEFAULT_STREAK;
    return JSON.parse(data) as StreakData;
  } catch (error) {
    console.error('Failed to load streak data:', error);
    return DEFAULT_STREAK;
  }
}

/**
 * Save streak data to localStorage
 */
export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save streak data:', error);
  }
}

/**
 * Update streak after a daily game completion
 * Returns the updated streak data
 */
export function updateStreak(dayNumber: number, isWon: boolean): StreakData {
  const current = loadStreakData();

  // If lost, reset current streak
  if (!isWon) {
    const updated = { ...current, currentStreak: 0 };
    saveStreakData(updated);
    return updated;
  }

  // Already counted this day
  if (current.lastWonDay === dayNumber) {
    return current;
  }

  let newStreak: number;

  // Consecutive day win
  if (current.lastWonDay === dayNumber - 1) {
    newStreak = current.currentStreak + 1;
  } else {
    // Missed day(s), start new streak
    newStreak = 1;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    maxStreak: Math.max(current.maxStreak, newStreak),
    lastWonDay: dayNumber,
  };

  saveStreakData(updated);
  return updated;
}
