import { useEffect, useRef } from 'react';
import { annotate } from 'rough-notation';

export function Logo() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      const annotation = annotate(titleRef.current, {
        type: 'highlight',
        color: '#d4a017',
        animationDuration: 800,
      });
      annotation.show();
    }
  }, []);

  return (
    <h1
      ref={titleRef}
      className="text-4xl md:text-4xl lg:text-5xl font-bold tracking-wider"
      style={{
        color: '#1a4a5e',
      }}
    >
      Le mot du jour
    </h1>
  );
}
