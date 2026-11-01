import { useEffect, useState } from 'react';
import { Transport } from '@mosaic-home/design-system/react';

const DURATION = 222;

export function TransportExample() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(41);
  const [loop, setLoop] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition((p) => (p >= DURATION ? 0 : p + 1)), 1000);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <Transport
      label="Playback"
      duration={DURATION}
      position={position}
      playing={playing}
      loop={loop}
      onPlayingChange={setPlaying}
      onSeek={setPosition}
      onLoopChange={setLoop}
    />
  );
}
