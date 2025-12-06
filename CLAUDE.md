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
├── components/     # React components
│   ├── Logo.tsx        # Game title with blur effect
│   ├── Header.tsx      # Page header
│   ├── GameBoard.tsx   # Main game grid container
│   ├── GameGrid.tsx    # Grid of letter cells
│   ├── LetterCell.tsx  # Individual letter cell with status colors
│   └── Keyboard.tsx    # AZERTY virtual keyboard
├── types/
│   └── game.ts         # TypeScript types (Letter, Attempt, Round)
├── utils/
│   ├── constants.ts    # Game constants and mock data
│   └── wordList.ts     # 100 French words + daily word selection
├── App.tsx
├── index.css       # Tailwind theme + custom animations
└── main.tsx
```

## Game Specifications (Classic Motus Rules)

### Overview
- French word-guessing game based on the TV show **Motus**
- Guess a French word in **6 attempts maximum**
- Words must exist in French dictionary

### Color Feedback System

| Color | Hex Code | Status | Meaning |
|-------|----------|--------|---------|
| **Red** | #dc4a4a | `correct` | Letter is in the **correct position** |
| **Yellow** | #d4a017 | `present` | Letter is in the word but **wrong position** |
| **No color** | transparent | `absent` | Letter is **not in the word** |
| **Blue** | #3a7ca5 | `hint` | Pre-filled hint letter (from previous feedback) |

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

### Hint System
- After each attempt, correctly positioned letters (red) become **hints** for the next row
- Hints are pre-filled in **blue** at the start of the next attempt
- Player must complete the word around these fixed hints

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
- `tusmo-hint`: #3a7ca5 (blue - pre-filled hints)
- `tusmo-absent`: transparent (not in word)

## Word List

Located in `src/utils/wordList.ts`:
- **100 curated French common nouns** (no proper nouns)
- **Word lengths**: 6-10 letters (35× 6-letter, 30× 7-letter, 20× 8-letter, 10× 9-letter, 5× 10-letter)
- **No accents** (e.g., CHATEAU instead of CHÂTEAU) per Scrabble/ODS conventions
- **Pre-shuffled** for variety in daily word lengths

### Helper Functions
```typescript
import { getDailyWord, getDailyWordNumber } from './utils/wordList';

getDailyWord();       // Returns today's word, e.g., "FAMILLE"
getDailyWordNumber(); // Returns day number since Jan 1, 2024
```

Words cycle through the list starting from January 1, 2024. After 100 days, the list repeats.

## Current State
- Static UI complete with mock data
- Word list implemented (100 words)
- Need: input handling, game state management, word validation
