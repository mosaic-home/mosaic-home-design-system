import { useState } from 'react';
import { LockControl } from '@mosaic-home/design-system/react';
import type { LockState } from '@mosaic-home/design-system/web';

export function LockControlExample() {
  const [state, setState] = useState<LockState>('locked');
  // Shows the busy state until the lock reports back.
  const move = (busy: LockState, done: LockState) => {
    setState(busy);
    setTimeout(() => setState(done), 1000);
  };
  return (
    <LockControl
      label="Front door"
      state={state}
      confirm
      onLock={() => move('locking', 'locked')}
      onUnlock={() => move('unlocking', 'unlocked')}
    />
  );
}
