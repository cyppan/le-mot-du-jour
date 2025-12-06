import { useReducer, useEffect, useCallback, useRef } from 'react';
import type { Attempt, LetterStatus } from '../types/game';
import { getDailyWord, getDailyWordNumber } from '../utils/wordList';
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
  type PersistedState,
} from '../utils/storage';

export interface GameState {
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
  | { type: 'CLEAR_ERROR' };

function createInitialState(): GameState {
  const targetWord = getDailyWord();
  const dayNumber = getDailyWordNumber();

  // Try to load saved state synchronously
  const saved = loadGameState();
  if (saved) {
    return {
      targetWord,
      wordLength: targetWord.length,
      dayNumber: saved.dayNumber,
      // Use saved attempt if exists, otherwise just start with first letter
      // Display logic shows hints at correct positions, ADD_LETTER auto-fills them
      currentAttempt: saved.currentAttempt || targetWord[0],
      currentRow: saved.attempts.length,
      attempts: saved.attempts,
      keyStates: saved.keyStates,
      isComplete: saved.isComplete,
      isWon: saved.isWon,
      errorMessage: null,
    };
  }

  return {
    targetWord,
    wordLength: targetWord.length,
    dayNumber,
    currentAttempt: targetWord[0], // Start with first letter
    currentRow: 0,
    attempts: [],
    keyStates: {},
    isComplete: false,
    isWon: false,
    errorMessage: null,
  };
}

function getHintPositions(attempts: Attempt[]): Set<number> {
  const hintPositions = new Set<number>();
  // First letter is always a hint
  hintPositions.add(0);

  // Add positions from correctly guessed letters
  for (const attempt of attempts) {
    if (!attempt.isComplete) continue;
    attempt.letters.forEach((letter, index) => {
      if (letter.status === 'correct') {
        hintPositions.add(index);
      }
    });
  }

  return hintPositions;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_LETTER': {
      // Don't add if game is complete
      if (state.isComplete) return state;

      // Don't add if current attempt is already full
      if (state.currentAttempt.length >= state.wordLength) return state;

      const letter = action.payload.toUpperCase();

      // Check if it's a valid letter
      if (!/^[A-Z]$/.test(letter)) return state;

      // Get hint positions to skip
      const hintPositions = getHintPositions(state.attempts);
      const currentPos = state.currentAttempt.length;

      // Build the new attempt string, filling in hints as needed
      let newAttempt = state.currentAttempt;

      // If current position is a hint, we need to add the hint letter first
      if (hintPositions.has(currentPos) && currentPos > 0) {
        newAttempt += state.targetWord[currentPos];
      }

      // Now add the typed letter at the next non-hint position
      let insertPos = newAttempt.length;
      while (hintPositions.has(insertPos) && insertPos < state.wordLength) {
        newAttempt += state.targetWord[insertPos];
        insertPos++;
      }

      // If we've filled all positions with hints, don't add more
      if (newAttempt.length >= state.wordLength) {
        return state;
      }

      newAttempt += letter;

      // After adding the letter, auto-fill any following hint positions
      while (
        hintPositions.has(newAttempt.length) &&
        newAttempt.length < state.wordLength
      ) {
        newAttempt += state.targetWord[newAttempt.length];
      }

      return {
        ...state,
        currentAttempt: newAttempt,
        errorMessage: null,
      };
    }

    case 'REMOVE_LETTER': {
      // Don't remove if game is complete
      if (state.isComplete) return state;

      // Don't remove the first letter (always revealed)
      if (state.currentAttempt.length <= 1) return state;

      const hintPositions = getHintPositions(state.attempts);

      // Remove letters from the end, skipping over hint positions
      let newAttempt = state.currentAttempt;
      while (newAttempt.length > 1) {
        const lastPos = newAttempt.length - 1;
        if (!hintPositions.has(lastPos)) {
          // Remove this non-hint letter
          newAttempt = newAttempt.slice(0, -1);
          break;
        }
        // Skip hint positions
        newAttempt = newAttempt.slice(0, -1);
      }

      return {
        ...state,
        currentAttempt: newAttempt,
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

      // Check if word is valid
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
      // Hints will be shown by display logic and auto-filled by ADD_LETTER
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
        targetWord,
        wordLength: targetWord.length,
        dayNumber: loaded.dayNumber,
        // Use saved attempt if exists, otherwise just start with first letter
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

    const toSave: PersistedState = {
      dayNumber: state.dayNumber,
      attempts: state.attempts,
      keyStates: state.keyStates,
      isComplete: state.isComplete,
      isWon: state.isWon,
      currentAttempt: state.currentAttempt,
    };
    saveGameState(toSave);
  }, [
    state.dayNumber,
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

  return {
    state,
    addLetter,
    removeLetter,
    submitGuess,
    clearError,
  };
}
