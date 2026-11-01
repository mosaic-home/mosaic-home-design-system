import { useEffect, useState } from 'react';
import { AlarmPanel } from '@mosaic-home/design-system/react';
import type { AlarmState } from '@mosaic-home/design-system/web';

const EXIT_DELAY = 30;

export function AlarmPanelExample() {
  const [state, setState] = useState<AlarmState>('disarmed');
  const [mode, setMode] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (state !== 'arming') return;
    const exit = setTimeout(() => setState('armed'), EXIT_DELAY * 1000);
    return () => clearTimeout(exit);
  }, [state]);
  const arm = (next: string) => {
    setMode(next);
    setDeadline(Date.now() + EXIT_DELAY * 1000);
    setState('arming');
  };
  // The app checks the code; the panel only hands it over and clears it.
  const disarm = (code: string | undefined) => {
    if (code !== '1234') {
      setError('Wrong code');
      return;
    }
    setError(null);
    setState('disarmed');
  };
  return (
    <AlarmPanel
      label="House alarm"
      state={state}
      mode={mode}
      deadline={state === 'arming' ? deadline : null}
      delay={EXIT_DELAY}
      error={error}
      onArm={arm}
      onDisarm={disarm}
    />
  );
}
