import { useEffect, useState } from 'react';
import { VoiceBar } from '@mosaic-home/design-system/react';
import type { VoicePhase } from '@mosaic-home/design-system/web';

export function VoiceBarExample() {
  const [phase, setPhase] = useState<VoicePhase>('listening');
  const [level, setLevel] = useState(0);
  const [label, setLabel] = useState<string>();
  useEffect(() => {
    if (phase !== 'listening') return;
    // Stands in for the microphone's input level (0–1).
    const timer = setInterval(() => setLevel(Math.random()), 90);
    return () => clearInterval(timer);
  }, [phase]);
  const done = () => {
    setPhase('transcribing');
    setTimeout(() => {
      setPhase('idle');
      setLabel('Added: "Buy more coffee filters"');
    }, 1500);
  };
  return (
    <VoiceBar
      variant="dictation"
      phase={phase}
      level={level}
      label={label}
      busy={phase === 'transcribing'}
      onCancel={() => setPhase('idle')}
      onDone={done}
    />
  );
}
