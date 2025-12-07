interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak <= 0) return null;

  return (
    <div className="flex items-center gap-1 text-tusmo-present font-bold">
      <span>🔥</span>
      <span>{streak}</span>
    </div>
  );
}
