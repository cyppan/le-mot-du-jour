export type LetterStatus =
  | 'empty'     // Not yet guessed
  | 'correct'   // Red circle - correct position
  | 'present'   // Yellow - correct letter, wrong position
  | 'absent'    // Transparent/gray - letter not in word
  | 'revealed'  // First letter (always shown, red)
  | 'hint';     // Pre-filled hint letter (blue)

export interface Letter {
  char: string;
  status: LetterStatus;
}

export interface Attempt {
  letters: Letter[];
  isComplete: boolean;
}

export interface Round {
  word: string;
  attempts: Attempt[];
  isComplete: boolean;
  isWon: boolean;
  maxAttempts: number;
}

export interface KeyState {
  [key: string]: LetterStatus;
}
