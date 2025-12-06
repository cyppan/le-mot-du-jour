import type { Round } from '../types/game';
import { RoundCard } from './RoundCard';

interface SidebarProps {
  completedRounds: Round[];
}

export function Sidebar({ completedRounds }: SidebarProps) {
  if (completedRounds.length === 0) {
    return null;
  }

  return (
    <aside className="flex flex-col gap-4">
      {completedRounds.map((round, index) => (
        <RoundCard key={index} round={round} />
      ))}
    </aside>
  );
}
