import { useEffect, useState } from 'react';
import { ApplianceCycle } from '@mosaic-home/design-system/react';
import type { ApplianceState } from '@mosaic-home/design-system/web';

const duration = 5400;

export function ApplianceCycleExample() {
  const [state, setState] = useState<ApplianceState>('running');
  const [remaining, setRemaining] = useState(4320);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (state !== 'running') return;
    const tick = setInterval(() => setRemaining((left) => Math.max(0, left - 60)), 60_000);
    return () => clearInterval(tick);
  }, [state]);

  if (!shown) return null;
  return (
    <ApplianceCycle
      name="Washing machine"
      state={remaining === 0 ? 'finished' : state}
      programme="Cotton 40°"
      stages={['Wash', 'Rinse', 'Spin']}
      stage={Math.floor(((duration - remaining) / duration) * 3)}
      remaining={remaining}
      duration={duration}
      endsAt="Ends 14:20"
      onPause={() => setState('paused')}
      onResume={() => setState('running')}
      onDismiss={() => setShown(false)}
    />
  );
}
