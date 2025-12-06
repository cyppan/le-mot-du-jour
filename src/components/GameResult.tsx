interface GameResultProps {
  isWon: boolean;
  word: string;
  attemptCount: number;
}

export function GameResult({ isWon, word, attemptCount }: GameResultProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-tusmo-bg-dark rounded-xl p-6 max-w-sm w-full text-center shadow-2xl border border-white/20">
        {isWon ? (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Bravo !</h2>
            <p className="text-white/80 mb-4">
              Vous avez trouvé <span className="font-bold text-tusmo-present">{word}</span> en{' '}
              <span className="font-bold">{attemptCount}</span> essai{attemptCount > 1 ? 's' : ''} !
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-2">Dommage !</h2>
            <p className="text-white/80 mb-2">
              Le mot était <span className="font-bold text-tusmo-correct">{word}</span>
            </p>
            <p className="text-white/60 text-sm">
              Revenez demain pour un nouvel essai
            </p>
          </>
        )}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-white/50 text-xs">
            Prochain mot dans quelques heures...
          </p>
        </div>
      </div>
    </div>
  );
}
