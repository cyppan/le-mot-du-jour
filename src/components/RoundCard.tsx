import type { Round } from '../types/game';
import { GameGrid } from './GameGrid';

interface RoundCardProps {
  round: Round;
}

export function RoundCard({ round }: RoundCardProps) {
  // Only show attempts that have been completed
  const completedAttempts = round.attempts.filter((a) => a.isComplete);

  return (
    <div
      className={`
        p-3 rounded-xl
        ${round.isWon ? 'bg-tusmo-present' : 'bg-tusmo-absent'}
      `}
    >
      <GameGrid
        attempts={completedAttempts}
        wordLength={round.word.length}
        isMini
        showEmptyRows={false}
      />
    </div>
  );
}
