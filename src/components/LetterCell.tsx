import type { LetterStatus } from '../types/game';

interface LetterCellProps {
  letter: string;
  status: LetterStatus;
  isCurrentCell?: boolean;
  isMini?: boolean;
  wordLength?: number;
}

// Size classes based on word length (mobile only, ~95vw total)
const sizeByWordLength: Record<number, string> = {
  6: 'w-[min(14vw,2.75rem)] h-[min(14vw,2.75rem)] text-[min(5vw,1.125rem)]',
  7: 'w-[min(12vw,2.75rem)] h-[min(12vw,2.75rem)] text-[min(4.5vw,1.125rem)]',
  8: 'w-[min(11vw,2.75rem)] h-[min(11vw,2.75rem)] text-[min(4vw,1.125rem)]',
  9: 'w-[min(9.5vw,2.75rem)] h-[min(9.5vw,2.75rem)] text-[min(3.5vw,1.125rem)]',
  10: 'w-[min(8.5vw,2.75rem)] h-[min(8.5vw,2.75rem)] text-[min(3vw,1.125rem)]',
};

const statusClasses: Record<LetterStatus, string> = {
  empty: 'bg-transparent text-white',
  correct: 'bg-tusmo-correct text-white rounded-full',    // Red circle
  present: 'bg-tusmo-present text-gray-800',              // Yellow background
  absent: 'bg-transparent text-white/50',                 // Transparent, dimmed text
  revealed: 'bg-tusmo-correct text-white rounded-full',   // Red circle (first letter)
  hint: 'bg-tusmo-hint text-white rounded-full',          // Blue circle (pre-filled)
};

export function LetterCell({ letter, status, isCurrentCell = false, isMini = false, wordLength = 6 }: LetterCellProps) {
  const mobileSize = sizeByWordLength[wordLength] || sizeByWordLength[6];

  return (
    <div
      className={`
        ${isMini ? 'w-6 h-6 text-xs' : `${mobileSize} sm:w-11 sm:h-11 sm:text-lg md:w-12 md:h-12 md:text-xl`}
        ${statusClasses[status]}
        flex items-center justify-center
        font-bold uppercase
        transition-all duration-200
        border border-white/50
        ${isCurrentCell ? 'shadow-[0_0_12px_rgba(255,255,255,0.7)] animate-cell-pulse' : ''}
      `}
      aria-label={`Lettre ${letter || 'vide'}, ${status}`}
    >
      {letter}
    </div>
  );
}
