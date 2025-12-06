import { useEffect } from 'react';

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function ErrorToast({ message, onDismiss, duration = 2000 }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce"
      role="alert"
    >
      <div className="bg-tusmo-correct text-white px-4 py-2 rounded-lg shadow-lg font-medium">
        {message}
      </div>
    </div>
  );
}
