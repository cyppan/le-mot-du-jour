import type { Round } from '../types/game';
import { GameGrid } from './GameGrid';

interface GameBoardProps {
  round: Round;
  currentRow?: number;
  currentCol?: number;
}

export function GameBoard({ round, currentRow = 1, currentCol = 0 }: GameBoardProps) {
  return (
    <div className="flex flex-col items-center">
      <GameGrid
        attempts={round.attempts}
        wordLength={round.word.length}
        currentRow={currentRow}
        currentCol={currentCol}
      />
    </div>
  );
}
