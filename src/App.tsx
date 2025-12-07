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
  const { state, addLetter, removeLetter, submitGuess, clearError, startFreeMode } = useGameState();

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
        // User has typed at this position - show their letter
        const char = state.currentAttempt[i];
        // First letter gets 'revealed' status, others get 'empty'
        const status = i === 0 ? 'revealed' : 'empty';
        letters.push({ char, status });
      } else {
        // Empty position - show hint if available (as regular input, not blue)
        if (hints[i].char) {
          letters.push({ char: hints[i].char, status: 'empty' });
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

  // Calculate current column position
  const getCurrentCol = (): number => {
    return state.currentAttempt.length;
  };

  const round = buildRound();

  return (
    <div className="min-h-screen bg-tusmo-bg flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-start px-2 sm:px-4 py-2 sm:py-4 gap-4 sm:gap-6 md:gap-8">
        <div className="text-white/60 text-sm capitalize">
          {state.mode === 'daily'
            ? new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : 'Mode libre'}
        </div>
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
          mode={state.mode}
          onStartFreeMode={startFreeMode}
        />
      )}
    </div>
  );
}

export default App;
