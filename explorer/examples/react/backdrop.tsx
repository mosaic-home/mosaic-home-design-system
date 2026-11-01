import { useEffect, useState } from 'react';
import { Backdrop, Text } from '@mosaic-home/design-system/react';

const IDLE_MS = 30_000;

export function BackdropExample() {
  const [idle, setIdle] = useState(false);
  const [touches, setTouches] = useState(0);
  // Dim the canvas once the screen has been left alone; each touch restarts the wait.
  useEffect(() => {
    const timer = setTimeout(() => setIdle(true), IDLE_MS);
    return () => clearTimeout(timer);
  }, [touches]);
  const wake = () => {
    setIdle(false);
    setTouches((n) => n + 1);
  };
  return (
    // Content inside a .mh-backdrop-host stays above the backdrop.
    <main className="mh-backdrop-host" onPointerDown={wake}>
      <Backdrop drift dim={idle} />
      <Text variant="display">22:40</Text>
    </main>
  );
}
