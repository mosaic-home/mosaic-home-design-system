import { useEffect, useState } from 'react';
import { Button, Waveform } from '@mosaic-home/design-system/react';

const duration = 24;
// Loudness per bucket, 0 to 1; `waveformPeaks` makes these from decoded samples.
const peaks = Array.from({ length: 64 }, (_, i) => 0.15 + 0.8 * Math.abs(Math.sin(i / 2.3)));

export function WaveformExample() {
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setPosition((p) => (p + 0.25 >= duration ? 0 : p + 0.25)), 250);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <>
      <Button icon={playing ? 'pause' : 'play'} size="small" onClick={() => setPlaying(!playing)}>
        {playing ? 'Pause' : 'Play'}
      </Button>
      <Waveform
        peaks={peaks}
        label="Voice message"
        duration={duration}
        position={position}
        onSeek={setPosition}
      />
    </>
  );
}
