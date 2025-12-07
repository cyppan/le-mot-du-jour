# Tusmo - Project Guide

## Overview
Tusmo is a French word-guessing game similar to Wordle/Motus. Built as a full client-side React application.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (uses `@theme` directive in `src/index.css`)
- **Package Manager**: pnpm

## Project Structure
```
src/
├── components/          # React components
│   ├── Logo.tsx             # Game title with blur effect
│   ├── Header.tsx           # Page header
│   ├── GameBoard.tsx        # Main game grid container
│   ├── GameGrid.tsx         # Grid of letter cells
│   ├── LetterCell.tsx       # Individual letter cell with status colors
│   ├── Keyboard.tsx         # AZERTY virtual keyboard container
│   ├── KeyboardKey.tsx      # Individual keyboard key
│   ├── GameResult.tsx       # Win/lose modal with free mode button
│   └── ErrorToast.tsx       # Error message display
├── data/
│   └── motusDictionary.ts       # Motus dictionary (53K words, filtered from Lexique383)
├── hooks/
│   ├── useGameState.ts      # Core game state management (useReducer)
│   └── useKeyboardInput.ts  # Physical keyboard event handling
├── types/
│   └── game.ts              # TypeScript types (Letter, Attempt, Round, LetterStatus)
├── utils/
│   ├── constants.ts         # Game constants (MAX_ATTEMPTS)
│   ├── wordList.ts          # 100 French words + daily/random word selection
│   ├── gameLogic.ts         # Core game logic (evaluation, hints, validation)
│   └── storage.ts           # localStorage persistence (daily + free mode)
├── App.tsx              # Main app component, builds display state
├── index.css            # Tailwind theme + custom animations
└── main.tsx
```

## Game Modes

### Daily Mode (default)
- One word per day, same for all players
- Words from curated list of 100 common French nouns
- State persists until midnight, then resets

### Free Mode
- Unlimited games with random words from Motus dictionary (53K words)
- Uses filtered Lexique383 following original Motus France 2 rules
- Accessible via "Mode libre" button after completing daily game
- Includes nouns, adjectives, adverbs, infinitives, and participles (no conjugated verbs)
- State persists across refreshes (active games only)
- Refresh returns to daily mode if free game was completed

## Game Specifications (Classic Motus Rules)

### Overview
- French word-guessing game based on the TV show **Motus**
- Guess a French word in **6 attempts maximum**
- Words must exist in French dictionary

### Color Feedback System

| Color | Hex Code | Status | Meaning |
|-------|----------|--------|---------|
| **Red** | #dc4a4a | `correct` / `revealed` | Letter is in the **correct position** (or first letter) |
| **Yellow** | #d4a017 | `present` | Letter is in the word but **wrong position** |
| **No color** | transparent | `absent` | Letter is **not in the word** |
| **White** | - | `empty` | User input or visual hint (not yet evaluated) |

### Game Constraints

| Constant | Value | Description |
|----------|-------|-------------|
| `MAX_ATTEMPTS` | 6 | Maximum guesses per game |
| `DEFAULT_WORD_LENGTH` | 6 | Standard word length (can vary 6-10) |

### Gameplay Rules
1. **First letter revealed**: Always shown at the start of the game
2. **Guess validation**: All guesses must start with the revealed first letter
3. **Valid words only**: Guesses must be real French words from dictionary
4. **Feedback**: After each guess, letters are colored to show proximity to answer

### Duplicate Letter Handling (Edge Case)
When the target word contains duplicate letters:
- Each letter in the guess is evaluated **left-to-right**
- Exact matches (correct position) are marked **red** first
- Remaining letters are checked for presence, marked **yellow** only if occurrences remain
- Example: Target "ARBRE", Guess "ERRE" → E₁=yellow, R₁=red, R₂=absent (no more R's), E₂=red

### Hint System (Visual-Only)
- After each attempt, correctly positioned letters (red) become **visual hints** for the next row
- Hints are pre-filled at positions the user hasn't typed yet (displayed as white text, not blue)
- **Hints are NOT locked**: User types sequentially from position 1 and naturally overwrites hints
- User can type any valid word - hints are just visual guides to help remember found letters
- This differs from original Motus where hints were locked; here hints are for convenience only

### Keyboard
- **AZERTY layout** (French keyboard)
- Keys update color based on **best known status** for each letter:
  - Red > Yellow > No color (priority order)
  - Once a key is marked red/yellow, it keeps that status

### Win/Lose Conditions
- **Win**: Guess the word correctly (all letters red) within 6 attempts
- **Lose**: Exhaust all 6 attempts without finding the word

## Commands
```bash
pnpm dev      # Start dev server
pnpm build    # Build for production
pnpm lint     # Run ESLint
```

## Custom Tailwind Colors
Defined in `src/index.css` under `@theme`:
- `tusmo-bg`: #1a4a5e (background)
- `tusmo-correct`: #dc4a4a (red - correct position)
- `tusmo-present`: #d4a017 (yellow - wrong position)
- `tusmo-absent`: transparent (not in word)

## Word Sources

### Daily Mode - Curated List (`src/utils/wordList.ts`)
- **100 curated French common nouns** (no proper nouns)
- **Word lengths**: 6-10 letters (35× 6-letter, 30× 7-letter, 20× 8-letter, 10× 9-letter, 5× 10-letter)
- **No accents** (e.g., CHATEAU instead of CHÂTEAU) per Scrabble/ODS conventions
- **Pre-shuffled** for variety in daily word lengths
- Words cycle through the list starting from January 1, 2024. After 100 days, the list repeats.

### Word Validation & Free Mode - Motus Dictionary (`src/data/motusDictionary.ts`)
- **53,611 words** filtered from Lexique 3.83 (http://www.lexique.org)
- Follows **original Motus France 2 rules** (not SUTOM which allows conjugations)
- Used for ALL word validation (both daily and free modes)
- **Allowed**: Nouns, adjectives, adverbs, verb infinitives, past/present participles
- **Excluded**: Conjugated verb forms (e.g., MANGEAIT, MANGEONS)
- Word lengths: 6-10 letters only
- Accents removed to match game display
- All 100 curated daily words are present in this dictionary

| Length | Count |
|--------|-------|
| 6 letters | 7,605 |
| 7 letters | 10,895 |
| 8 letters | 12,710 |
| 9 letters | 12,247 |
| 10 letters | 10,154 |

**Regenerate dictionary**: `npx tsx scripts/generateMotusDictionary.ts`

### Helper Functions
```typescript
import { getDailyWord, getDailyWordNumber, getRandomWord } from './utils/wordList';

getDailyWord();       // Returns today's word, e.g., "FAMILLE"
getDailyWordNumber(); // Returns day number since Jan 1, 2024
getRandomWord();      // Returns random word from Motus dictionary (for free mode)
```

## Architecture

### State Management (`useGameState.ts`)
The game uses `useReducer` with the following state:
```typescript
type GameMode = 'daily' | 'free';

interface GameState {
  mode: GameMode;                 // Current game mode
  targetWord: string;             // Word to guess
  wordLength: number;             // Length of target word
  dayNumber: number;              // Day number since Jan 1, 2024
  currentAttempt: string;         // User's current input (sequential string)
  currentRow: number;             // Current row index
  attempts: Attempt[];            // Completed attempts with evaluated letters
  keyStates: Record<string, LetterStatus>;  // Keyboard key colors
  isComplete: boolean;            // Game over flag
  isWon: boolean;                 // Win flag
  errorMessage: string | null;    // Validation error to display
}
```

### Key Design Decisions

**Sequential Input Model**
- `currentAttempt` is a simple string that grows as user types
- Position 0 is always the revealed first letter (pre-filled)
- User types from position 1 onward
- Simple append/remove operations (no complex cursor logic)

**Display vs State Separation**
- Game state (`currentAttempt`) is minimal - just the typed string
- Display logic (`buildCurrentRow()` in App.tsx) handles visual presentation
- Hints are computed at render time, shown at positions > `currentAttempt.length`
- This separation keeps state simple and predictable

**Persistence (`src/utils/storage.ts`)**
- Two separate localStorage keys:
  - `tusmo_game_state` - Daily mode state (resets on new day)
  - `tusmo_free_mode_state` - Free mode state (persists until game complete)
- On page load:
  1. Check for active (incomplete) free mode game → resume it
  2. Otherwise, load daily mode state or start fresh daily game
- Completed free mode games are cleared, returning user to daily mode on refresh

### Actions
| Action | Description |
|--------|-------------|
| `ADD_LETTER` | Append letter to `currentAttempt` |
| `REMOVE_LETTER` | Remove last letter (keep first letter) |
| `SUBMIT_GUESS` | Validate and evaluate the guess |
| `CLEAR_ERROR` | Dismiss error message |
| `START_FREE_MODE` | Start new game with random word from dictionary |

## Current State
- Fully functional game with daily words
- Free mode with unlimited random words
- Physical keyboard + virtual AZERTY keyboard support
- localStorage persistence for both modes
- Win/lose detection with result modal
- Smooth modal transition animation (fade-out before state change)
- Error validation (word length, first letter, valid French word)
