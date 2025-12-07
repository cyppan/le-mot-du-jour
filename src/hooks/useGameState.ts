import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { Attempt, LetterStatus } from '../types/game';
import { getDailyWord, getDailyWordNumber, getRandomWord } from '../utils/wordList';
import { MAX_ATTEMPTS } from '../utils/constants';
import {
  evaluateGuess,
  isValidWord,
  updateKeyStates,
  isWinningGuess,
  createAttempt,
} from '../utils/gameLogic';
import {
  saveGameState,
  loadGameState,
  saveFreeModeState,
  loadFreeModeState,
  clearFreeModeState,
  type PersistedState,
  type FreeModePersistedState,
} from '../utils/storage';

export type GameMode = 'daily' | 'free';

export interface GameState {
  mode: GameMode;
  targetWord: string;
  wordLength: number;
  dayNumber: number;
  currentAttempt: string;
  currentRow: number;
  attempts: Attempt[];
  keyStates: Record<string, LetterStatus>;
  isComplete: boolean;
  isWon: boolean;
  errorMessage: string | null;
}

type GameAction =
  | { type: 'ADD_LETTER'; payload: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_GUESS' }
  | { type: 'LOAD_STATE'; payload: PersistedState }
  | { type: 'CLEAR_ERROR' }
  | { type: 'START_FREE_MODE' };

function createInitialState(): GameState {
  const dailyWord = getDailyWord();
  const dayNumber = getDailyWordNumber();

  // Check for active (not complete) free mode game first
  const freeModeSaved = loadFreeModeState();
  if (freeModeSaved && !freeModeSaved.isComplete) {
    return {
      mode: 'free',
      targetWord: freeModeSaved.targetWord,
      wordLength: freeModeSaved.targetWord.length,
      dayNumber,
      currentAttempt: freeModeSaved.currentAttempt || freeModeSaved.targetWord[0],
      currentRow: freeModeSaved.attempts.length,
      attempts: freeModeSaved.attempts,
      keyStates: freeModeSaved.keyStates,
      isComplete: freeModeSaved.isComplete,
      isWon: freeModeSaved.isWon,
      errorMessage: null,
    };
  }

  // Clear any completed free mode state
  if (freeModeSaved && freeModeSaved.isComplete) {
    clearFreeModeState();
  }

  // Try to load daily saved state
  const saved = loadGameState();
  if (saved) {
    return {
      mode: 'daily',
      targetWord: dailyWord,
      wordLength: dailyWord.length,
      dayNumber: saved.dayNumber,
      currentAttempt: saved.currentAttempt || dailyWord[0],
      currentRow: saved.attempts.length,
      attempts: saved.attempts,
      keyStates: saved.keyStates,
      isComplete: saved.isComplete,
      isWon: saved.isWon,
      errorMessage: null,
    };
  }

  // Fresh daily game
  return {
    mode: 'daily',
    targetWord: dailyWord,
    wordLength: dailyWord.length,
    dayNumber,
    currentAttempt: dailyWord[0],
    currentRow: 0,
    attempts: [],
    keyStates: {},
    isComplete: false,
    isWon: false,
    errorMessage: null,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      if (state.isComplete) return state;
      if (state.currentAttempt.length >= state.wordLength) return state;

      const letter = action.payload.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return state;

      // Simply append the letter
      return {
        ...state,
        currentAttempt: state.currentAttempt + letter,
        errorMessage: null,
      };
    }

    case 'REMOVE_LETTER': {
      if (state.isComplete) return state;
      if (state.currentAttempt.length <= 1) return state; // Keep first letter

      return {
        ...state,
        currentAttempt: state.currentAttempt.slice(0, -1),
        errorMessage: null,
      };
    }

    case 'SUBMIT_GUESS': {
      // Don't submit if game is complete
      if (state.isComplete) return state;

      const guess = state.currentAttempt.toUpperCase();

      // Check if word is complete
      if (guess.length !== state.wordLength) {
        return {
          ...state,
          errorMessage: `Le mot doit avoir ${state.wordLength} lettres`,
        };
      }

      // Check if word starts with correct first letter
      if (guess[0] !== state.targetWord[0]) {
        return {
          ...state,
          errorMessage: `Le mot doit commencer par ${state.targetWord[0]}`,
        };
      }

      // Check if word is valid (uses Grammalecte dictionary, same as SUTOM)
      if (!isValidWord(guess)) {
        return {
          ...state,
          errorMessage: 'Mot non reconnu',
        };
      }

      // Evaluate the guess
      const evaluatedLetters = evaluateGuess(guess, state.targetWord);
      const newAttempt = createAttempt(evaluatedLetters);
      const newAttempts = [...state.attempts, newAttempt];

      // Update keyboard states
      const newKeyStates = updateKeyStates(state.keyStates, evaluatedLetters);

      // Check for win
      const won = isWinningGuess(evaluatedLetters);

      // Check for game over
      const gameOver = won || newAttempts.length >= MAX_ATTEMPTS;

      // Start next row with just the first letter
      return {
        ...state,
        attempts: newAttempts,
        keyStates: newKeyStates,
        currentRow: newAttempts.length,
        currentAttempt: gameOver ? guess : state.targetWord[0],
        isComplete: gameOver,
        isWon: won,
        errorMessage: null,
      };
    }

    case 'LOAD_STATE': {
      const loaded = action.payload;
      const targetWord = getDailyWord();

      return {
        mode: 'daily',
        targetWord,
        wordLength: targetWord.length,
        dayNumber: loaded.dayNumber,
        currentAttempt: loaded.currentAttempt || targetWord[0],
        currentRow: loaded.attempts.length,
        attempts: loaded.attempts,
        keyStates: loaded.keyStates,
        isComplete: loaded.isComplete,
        isWon: loaded.isWon,
        errorMessage: null,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        errorMessage: null,
      };
    }

    case 'START_FREE_MODE': {
      const newWord = getRandomWord();
      return {
        mode: 'free',
        targetWord: newWord,
        wordLength: newWord.length,
        dayNumber: state.dayNumber,
        currentAttempt: newWord[0],
        currentRow: 0,
        attempts: [],
        keyStates: {},
        isComplete: false,
        isWon: false,
        errorMessage: null,
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const isFirstRender = useRef(true);

  // Save state when it changes (skip first render since we just loaded)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (state.mode === 'daily') {
      const toSave: PersistedState = {
        dayNumber: state.dayNumber,
        attempts: state.attempts,
        keyStates: state.keyStates,
        isComplete: state.isComplete,
        isWon: state.isWon,
        currentAttempt: state.currentAttempt,
      };
      saveGameState(toSave);
    } else {
      const toSave: FreeModePersistedState = {
        targetWord: state.targetWord,
        attempts: state.attempts,
        keyStates: state.keyStates,
        isComplete: state.isComplete,
        isWon: state.isWon,
        currentAttempt: state.currentAttempt,
      };
      saveFreeModeState(toSave);
    }
  }, [
    state.mode,
    state.dayNumber,
    state.targetWord,
    state.attempts,
    state.keyStates,
    state.isComplete,
    state.isWon,
    state.currentAttempt,
  ]);

  // Action creators
  const addLetter = useCallback((letter: string) => {
    dispatch({ type: 'ADD_LETTER', payload: letter });
  }, []);

  const removeLetter = useCallback(() => {
    dispatch({ type: 'REMOVE_LETTER' });
  }, []);

  const submitGuess = useCallback(() => {
    dispatch({ type: 'SUBMIT_GUESS' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const startFreeMode = useCallback(() => {
    dispatch({ type: 'START_FREE_MODE' });
  }, []);

  return {
    state,
    addLetter,
    removeLetter,
    submitGuess,
    clearError,
    startFreeMode,
  };
}
