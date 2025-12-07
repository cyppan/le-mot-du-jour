import { useState } from 'react';
import type { GameMode } from '../hooks/useGameState';

interface GameResultProps {
  isWon: boolean;
  word: string;
  attemptCount: number;
  mode: GameMode;
  onStartFreeMode: () => void;
}

export function GameResult({
  isWon,
  word,
  attemptCount,
  mode,
  onStartFreeMode,
}: GameResultProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleStartFreeMode = () => {
    setIsClosing(true);
    // Wait for fade-out animation to complete before changing state
    // Using 250ms to ensure CSS transition (200ms) has fully completed
    setTimeout(() => {
      onStartFreeMode();
    }, 250);
  };

  return (
    <div
      className={`
        fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50
        transition-opacity duration-200
        ${isClosing ? 'opacity-0' : 'opacity-100'}
      `}
    >
      <div
        className={`
          bg-tusmo-bg-dark rounded-xl p-6 max-w-sm w-full text-center shadow-2xl border border-white/20
          transition-all duration-200
          ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        `}
      >
        {isWon ? (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Bravo !</h2>
            <p className="text-white/80 mb-4">
              Vous avez trouvé{" "}
              <span className="font-bold text-tusmo-present">{word}</span> en{" "}
              <span className="font-bold">{attemptCount}</span> essai
              {attemptCount > 1 ? "s" : ""} !
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-2">Dommage !</h2>
            <p className="text-white/80 mb-4">
              Le mot était{" "}
              <span className="font-bold text-tusmo-correct">{word}</span>
            </p>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleStartFreeMode}
            disabled={isClosing}
            className="w-full py-3 px-4 bg-tusmo-present hover:bg-tusmo-present/80 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {mode === 'daily' ? 'Mode libre' : 'Nouveau mot'}
          </button>
          {mode === 'daily' && (
            <p className="text-white/50 text-xs mt-3">
              ou revenez demain pour un nouveau mot du jour
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
