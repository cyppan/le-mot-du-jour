import type { LetterStatus } from '../types/game';
import { KeyboardKey } from './KeyboardKey';
import { AZERTY_LAYOUT } from '../utils/constants';

interface KeyboardProps {
  keyStates: Record<string, LetterStatus>;
  onKeyPress?: (key: string) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
}

export function Keyboard({
  keyStates,
  onKeyPress = () => {},
  onEnter = () => {},
  onBackspace = () => {},
}: KeyboardProps) {
  return (
    <div
      className="flex flex-col items-center gap-1 sm:gap-1.5"
      role="group"
      aria-label="Clavier virtuel"
    >
      {AZERTY_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 sm:gap-1.5">
          {/* Add backspace on the last row at the start */}
          {rowIndex === 2 && (
            <KeyboardKey
              label="backspace"
              onClick={onBackspace}
              isWide
              isIcon
            />
          )}

          {row.map((key) => (
            <KeyboardKey
              key={key}
              label={key}
              status={keyStates[key.toLowerCase()]}
              onClick={() => onKeyPress(key)}
            />
          ))}

          {/* Add enter on the last row at the end */}
          {rowIndex === 2 && (
            <KeyboardKey
              label="enter"
              onClick={onEnter}
              isWide
              isIcon
            />
          )}
        </div>
      ))}
    </div>
  );
}
