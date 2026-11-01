import { useEffect, useState } from 'react';
import { RecordingPill } from '@mosaic-home/design-system/react';

export function RecordingPillExample() {
  const [recording, setRecording] = useState(true);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!recording || paused) return;
    // Stands in for the microphone's input level (0–1).
    const timer = setInterval(() => setLevel(Math.random()), 120);
    return () => clearInterval(timer);
  }, [recording, paused]);
  if (!recording) return <p aria-live="polite">Note saved</p>;
  return (
    <>
      <RecordingPill level={level} paused={paused} onPauseToggle={setPaused} onStop={() => setRecording(false)} />
      <p aria-live="polite">{paused ? 'Paused' : 'Recording'}</p>
    </>
  );
}
