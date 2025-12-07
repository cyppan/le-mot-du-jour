import type { Attempt } from '../types/game';
import { LetterCell } from './LetterCell';
import { MAX_ATTEMPTS } from '../utils/constants';

interface GameGridProps {
  attempts: Attempt[];
  wordLength: number;
  currentRow?: number;
  currentCol?: number;
  isMini?: boolean;
  showEmptyRows?: boolean;
}

export function GameGrid({ attempts, wordLength, currentRow, currentCol, isMini, showEmptyRows = true }: GameGridProps) {
  // Fill empty rows up to MAX_ATTEMPTS (unless showEmptyRows is false)
  const rows: Attempt[] = [...attempts];
  if (showEmptyRows) {
    while (rows.length < MAX_ATTEMPTS) {
      rows.push({
        isComplete: false,
        letters: Array.from({ length: wordLength }, () => ({
          char: '',
          status: 'empty' as const,
        })),
      });
    }
  }

  return (
    <div className="flex flex-col gap-[1px] sm:gap-[2px]">
      {rows.map((attempt, rowIndex) => (
        <div key={rowIndex} className="flex gap-[1px] sm:gap-[2px]">
          {attempt.letters.map((letter, colIndex) => (
            <LetterCell
              key={colIndex}
              letter={letter.char}
              status={letter.status}
              isCurrentCell={rowIndex === currentRow && colIndex === currentCol}
              isMini={isMini}
              wordLength={wordLength}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
