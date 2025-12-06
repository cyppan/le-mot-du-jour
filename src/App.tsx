import './App.css';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { Keyboard } from './components/Keyboard';
import { GameResult } from './components/GameResult';
import { ErrorToast } from './components/ErrorToast';
import { useGameState } from './hooks/useGameState';
import { useKeyboardInput } from './hooks/useKeyboardInput';
import { generateHintsRow } from './utils/gameLogic';
import { MAX_ATTEMPTS } from './utils/constants';
import type { Round, Attempt, Letter } from './types/game';

function App() {
  const { state, addLetter, removeLetter, submitGuess, clearError } = useGameState();

  // Handle physical keyboard input
  useKeyboardInput({
    onLetter: addLetter,
    onEnter: submitGuess,
    onBackspace: removeLetter,
    enabled: !state.isComplete,
  });

  // Build the current row from the current attempt string
  const buildCurrentRow = (): Attempt => {
    const hints = generateHintsRow(state.targetWord, state.attempts);
    const letters: Letter[] = [];

    for (let i = 0; i < state.wordLength; i++) {
      if (i < state.currentAttempt.length) {
        // Use the typed letter with appropriate status
        const char = state.currentAttempt[i];
        const hintStatus = hints[i].status;
        // If this position is a hint (or revealed), keep that status
        if (hintStatus === 'revealed' || hintStatus === 'hint') {
          letters.push({ char, status: hintStatus });
        } else {
          letters.push({ char, status: 'empty' });
        }
      } else {
        // Empty position - but show hint if available
        if (hints[i].char) {
          letters.push({ char: hints[i].char, status: hints[i].status });
        } else {
          letters.push({ char: '', status: 'empty' });
        }
      }
    }

    return {
      letters,
      isComplete: false,
    };
  };

  // Build the Round object for GameBoard
  const buildRound = (): Round => {
    const allAttempts: Attempt[] = [...state.attempts];

    // Add current row if game is not complete
    if (!state.isComplete && allAttempts.length < MAX_ATTEMPTS) {
      allAttempts.push(buildCurrentRow());
    }

    return {
      word: state.targetWord,
      attempts: allAttempts,
      isComplete: state.isComplete,
      isWon: state.isWon,
      maxAttempts: MAX_ATTEMPTS,
    };
  };

  // Calculate current column (first editable position after hints)
  const getCurrentCol = (): number => {
    const hints = generateHintsRow(state.targetWord, state.attempts);
    let col = state.currentAttempt.length;

    // Skip over hint positions to find the first editable position
    while (
      col < state.wordLength &&
      (hints[col].status === 'hint' || hints[col].status === 'revealed')
    ) {
      col++;
    }

    return col;
  };

  const round = buildRound();

  return (
    <div className="min-h-screen bg-tusmo-bg flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-4 gap-8">
        <GameBoard
          round={round}
          currentRow={state.currentRow}
          currentCol={getCurrentCol()}
        />
        <Keyboard
          keyStates={state.keyStates}
          onKeyPress={addLetter}
          onEnter={submitGuess}
          onBackspace={removeLetter}
        />
      </main>

      <footer className="text-center py-4 text-sm text-white/40">
        Réplique du jeu original « Tusmo », RIP
      </footer>

      {state.errorMessage && (
        <ErrorToast message={state.errorMessage} onDismiss={clearError} />
      )}

      {state.isComplete && (
        <GameResult
          isWon={state.isWon}
          word={state.targetWord}
          attemptCount={state.attempts.length}
        />
      )}
    </div>
  );
}

export default App;
