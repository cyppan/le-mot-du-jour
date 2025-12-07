import { Logo } from './Logo';

interface HeaderProps {
  dayNumber?: number;
}

export function Header({ dayNumber }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-6 sm:pb-6 md:pt-8 md:pb-8 gap-2">
      <Logo />
      {dayNumber && (
        <p className="text-white/60 text-sm">
          Mot #{dayNumber}
        </p>
      )}
    </header>
  );
}
