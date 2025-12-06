import { Logo } from './Logo';

interface HeaderProps {
  dayNumber?: number;
}

export function Header({ dayNumber }: HeaderProps) {
  return (
    <header className="flex flex-col items-center justify-center pt-8 pb-8 gap-2">
      <Logo />
      {dayNumber && (
        <p className="text-white/60 text-sm">
          Mot #{dayNumber}
        </p>
      )}
    </header>
  );
}
