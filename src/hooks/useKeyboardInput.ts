import { useEffect } from 'react';

interface UseKeyboardInputProps {
  onLetter: (char: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  enabled?: boolean;
}

/**
 * Hook to handle physical keyboard input for the game.
 * Listens for letter keys (A-Z), Enter, and Backspace.
 */
export function useKeyboardInput({
  onLetter,
  onEnter,
  onBackspace,
  enabled = true,
}: UseKeyboardInputProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if modifier keys are pressed (except Shift for uppercase)
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // Ignore if focus is on an input element
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        onEnter();
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault();
        onLetter(event.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLetter, onEnter, onBackspace, enabled]);
}
