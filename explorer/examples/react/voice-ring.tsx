import { useEffect, useState } from 'react';
import { VoiceRing } from '@mosaic-home/design-system/react';
import type { VoiceRingPhase } from '@mosaic-home/design-system/web';

/** Where each phase goes next, and after how long. */
const NEXT: Partial<Record<VoiceRingPhase, [VoiceRingPhase, number]>> = {
  listening: ['thinking', 3000],
  thinking: ['speaking', 1500],
  speaking: ['idle', 2500],
};

const DETAIL: Partial<Record<VoiceRingPhase, string>> = {
  listening: 'Turn on the lights in the study',
  speaking: 'Done. The study lights are on.',
};

export function VoiceRingExample() {
  const [phase, setPhase] = useState<VoiceRingPhase>('idle');

  useEffect(() => {
    const next = NEXT[phase];
    if (!next) return;
    const timer = setTimeout(() => setPhase(next[0]), next[1]);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <VoiceRing
      phase={phase}
      detail={DETAIL[phase]}
      level={phase === 'listening' ? 0.6 : 0}
      onTap={() => setPhase(phase === 'idle' ? 'listening' : 'idle')}
    />
  );
}
