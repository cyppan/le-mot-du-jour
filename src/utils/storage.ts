import type { Attempt, LetterStatus } from '../types/game';
import { getDailyWordNumber } from './wordList';

const STORAGE_KEY = 'tusmo_game_state';

export interface PersistedState {
  dayNumber: number;
  attempts: Attempt[];
  keyStates: Record<string, LetterStatus>;
  isComplete: boolean;
  isWon: boolean;
  currentAttempt: string;
}

/**
 * Save game state to localStorage
 */
export function saveGameState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

/**
 * Load game state from localStorage
 * Returns null if no saved state or if it's a new day
 */
export function loadGameState(): PersistedState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
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
 * Clear game state from localStorage
 */
export function clearGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}
