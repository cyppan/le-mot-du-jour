import type { GameMode } from '../hooks/useGameState';

interface ModeSwitcherProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={() => onModeChange('daily')}
        className={`pb-0.5 transition-colors ${
          mode === 'daily'
            ? 'text-white border-b-2 border-white'
            : 'text-white/60 hover:text-white/80 cursor-pointer'
        }`}
      >
        Le Mot du Jour
      </button>
      <span className="text-white/40">|</span>
      <button
        onClick={() => onModeChange('free')}
        className={`pb-0.5 transition-colors ${
          mode === 'free'
            ? 'text-white border-b-2 border-white'
            : 'text-white/60 hover:text-white/80 cursor-pointer'
        }`}
      >
        Mode Libre
      </button>
    </div>
  );
}
