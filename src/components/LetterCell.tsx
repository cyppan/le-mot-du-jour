import type { LetterStatus } from '../types/game';

interface LetterCellProps {
  letter: string;
  status: LetterStatus;
  isCurrentCell?: boolean;
  isMini?: boolean;
}

const statusClasses: Record<LetterStatus, string> = {
  empty: 'bg-transparent text-white',
  correct: 'bg-tusmo-correct text-white rounded-full',    // Red circle
  present: 'bg-tusmo-present text-gray-800',              // Yellow background
  absent: 'bg-transparent text-white/50',                 // Transparent, dimmed text
  revealed: 'bg-tusmo-correct text-white rounded-full',   // Red circle (first letter)
  hint: 'bg-tusmo-hint text-white rounded-full',          // Blue circle (pre-filled)
};

export function LetterCell({ letter, status, isCurrentCell = false, isMini = false }: LetterCellProps) {
  return (
    <div
      className={`
        ${isMini ? 'w-6 h-6 text-xs' : 'w-11 h-11 text-lg md:w-12 md:h-12 md:text-xl'}
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
