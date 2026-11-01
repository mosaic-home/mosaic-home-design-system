import { useState } from 'react';
import { useTokens } from '@mosaic-home/design-system/react';

export function ElevationExample() {
  const [pressed, setPressed] = useState(false);
  // The raw values, for renderers that draw their own shadows (a canvas, a native view).
  const { blur, offsetY } = useTokens().elevation[2];
  return (
    <article
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      title={`Level 2: ${offsetY}px down, ${blur}px blur`}
      style={{
        padding: 'var(--mh-space-lg)',
        borderRadius: 'var(--mh-radius-lg)',
        background: 'var(--mh-surface-solid)',
        // Levels 1–3 are the --mh-shadow-* variables; the theme decides between a shadow, a glow or none.
        boxShadow: pressed ? 'var(--mh-shadow-3)' : 'var(--mh-shadow-1)',
      }}
    >
      Front door locked
    </article>
  );
}
