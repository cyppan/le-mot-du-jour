import type { Letter, LetterStatus, Attempt } from '../types/game';
import { FRENCH_DICTIONARY } from '../data/frenchDictionary';

/**
 * Evaluates a guess against the target word following Motus rules.
 *
 * Algorithm (handles duplicate letters correctly):
 * 1. First pass: Mark exact matches as 'correct' (red)
 * 2. Track remaining target letters (those not matched exactly)
 * 3. Second pass: For each non-exact letter, check if it exists in remaining pool
 *    - If yes: mark 'present' (yellow), remove from pool
 *    - If no: mark 'absent'
 */
export function evaluateGuess(guess: string, target: string): Letter[] {
  const result: Letter[] = [];
  const targetLetters = target.split('');
  const remainingPool: (string | null)[] = [...targetLetters];

  // First pass: exact matches (correct position = red)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetLetters[i]) {
      result[i] = { char: guess[i], status: 'correct' };
      remainingPool[i] = null; // Remove from pool
    } else {
      result[i] = { char: guess[i], status: 'empty' }; // Placeholder
    }
  }

  // Second pass: present/absent
  for (let i = 0; i < guess.length; i++) {
    if (result[i].status === 'correct') continue;

    const letterIndex = remainingPool.indexOf(guess[i]);
    if (letterIndex !== -1) {
      result[i] = { char: guess[i], status: 'present' };
      remainingPool[letterIndex] = null; // Remove from pool
    } else {
      result[i] = { char: guess[i], status: 'absent' };
    }
  }

  return result;
}

/**
 * Checks if a word exists in the French dictionary.
 */
export function isValidWord(word: string): boolean {
  return FRENCH_DICTIONARY.has(word.toUpperCase());
}

/**
 * Creates the initial row for a new attempt based on previous feedback.
 * Pre-fills the first letter as 'revealed' and correctly positioned letters as 'hint'.
 */
export function generateHintsRow(
  targetWord: string,
  previousAttempts: Attempt[]
): Letter[] {
  const wordLength = targetWord.length;
  const hints: Letter[] = Array(wordLength)
    .fill(null)
    .map(() => ({
      char: '',
      status: 'empty' as LetterStatus,
    }));

  // First letter is always revealed
  hints[0] = { char: targetWord[0], status: 'revealed' };

  // Find all positions that have been correctly guessed
  for (const attempt of previousAttempts) {
    if (!attempt.isComplete) continue;
    attempt.letters.forEach((letter, index) => {
      if (letter.status === 'correct') {
        hints[index] = { char: letter.char, status: 'hint' };
      }
    });
  }

  return hints;
}

/**
 * Updates keyboard states based on letter feedback.
 * Priority: correct > present > absent
 */
export function updateKeyStates(
  currentStates: Record<string, LetterStatus>,
  newLetters: Letter[]
): Record<string, LetterStatus> {
  const updated = { ...currentStates };
  const priority: Record<LetterStatus, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    empty: 0,
    revealed: 0,
    hint: 0,
  };

  for (const letter of newLetters) {
    const key = letter.char.toLowerCase();
    const currentPriority = priority[updated[key] || 'empty'];
    const newPriority = priority[letter.status];

    if (newPriority > currentPriority) {
      updated[key] = letter.status;
    }
  }

  return updated;
}

/**
 * Checks if the guess is a winning guess (all letters correct).
 */
export function isWinningGuess(letters: Letter[]): boolean {
  return letters.every((letter) => letter.status === 'correct');
}

/**
 * Creates an Attempt object from evaluated letters.
 */
export function createAttempt(letters: Letter[]): Attempt {
  return {
    letters,
    isComplete: true,
  };
}
