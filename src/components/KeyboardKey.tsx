import type { LetterStatus } from '../types/game';

interface KeyboardKeyProps {
  label: string;
  status?: LetterStatus;
  onClick: () => void;
  isWide?: boolean;
  isIcon?: boolean;
}

const statusClasses: Record<LetterStatus | 'default', string> = {
  default: 'bg-tusmo-key text-white hover:bg-tusmo-key-hover',
  empty: 'bg-tusmo-key text-white hover:bg-tusmo-key-hover',
  correct: 'bg-tusmo-correct text-white',                 // Red - correct position
  present: 'bg-tusmo-present text-gray-800',              // Yellow - wrong position
  absent: 'bg-tusmo-absent text-white/50',                // Gray - not in word
  revealed: 'bg-tusmo-correct text-white',
  hint: 'bg-tusmo-key text-white hover:bg-tusmo-key-hover',
};

export function KeyboardKey({
  label,
  status,
  onClick,
  isWide = false,
  isIcon = false,
}: KeyboardKeyProps) {
  const widthClass = isWide ? 'w-[min(14vw,3.5rem)] sm:w-14 md:w-16' : 'w-[min(8.5vw,2.25rem)] sm:w-9 md:w-10';
  const statusClass = statusClasses[status || 'default'];

  return (
    <button
      onClick={onClick}
      className={`
        ${widthClass}
        ${statusClass}
        h-[min(12vw,3rem)] sm:h-12 md:h-14
        rounded-md
        font-bold text-sm md:text-base
        uppercase
        flex items-center justify-center
        transition-colors duration-150
        active:scale-95
      `}
      aria-label={label}
    >
      {isIcon ? (
        label === 'backspace' ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M2.515 10.674a1.875 1.875 0 0 0 0 2.652L8.89 19.7c.352.351.829.549 1.326.549H19.5a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374ZM12.53 9.22a.75.75 0 1 0-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L15.31 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )
      ) : (
        label
      )}
    </button>
  );
}
