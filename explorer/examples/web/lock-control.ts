import { createLockControl, type LockState } from '@mosaic-home/design-system/web';

// Shows the busy state until the lock reports back.
const move = (busy: LockState, done: LockState) => {
  lock.update({ state: busy });
  setTimeout(() => lock.update({ state: done }), 1000);
};

const lock = createLockControl({
  label: 'Front door',
  state: 'locked',
  // Unlocking asks for a second tap.
  confirm: true,
  onLock: () => move('locking', 'locked'),
  onUnlock: () => move('unlocking', 'unlocked'),
});

document.body.append(lock.el);
