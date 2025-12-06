interface RoundInfoProps {
  roundNumber: number;
  letterCount: number;
}

export function RoundInfo({ roundNumber, letterCount }: RoundInfoProps) {
  return (
    <div className="flex justify-center gap-8 text-white text-lg md:text-xl font-medium mb-4">
      <span>Mot {roundNumber}</span>
      <span>{letterCount} lettres</span>
    </div>
  );
}
