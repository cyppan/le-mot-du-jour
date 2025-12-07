import { Logo } from './Logo';
import { StreakBadge } from './StreakBadge';

interface HeaderProps {
  dayNumber?: number;
  streak?: number;
}

export function Header({ dayNumber, streak = 0 }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 md:pt-8 md:pb-8 gap-2">
      <Logo />
      <div className="flex items-center gap-3">
        {dayNumber && (
          <p className="text-white/60 text-sm">
            Mot #{dayNumber}
          </p>
        )}
        <StreakBadge streak={streak} />
      </div>
    </header>
  );
}
