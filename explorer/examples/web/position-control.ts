import { createPositionControl } from '@mosaic-home/design-system/web';

const blind = createPositionControl({
  label: 'Studio blind',
  state: 'stopped',
  position: 50,
  can: { open: true, close: true, stop: true, position: true },
  labels: { open: 'Raise', close: 'Lower' },
  onOpen: () => blind.update({ state: 'open', position: 100 }),
  onClose: () => blind.update({ state: 'closed', position: 0 }),
  onStop: () => blind.update({ state: 'stopped' }),
  onPosition: (position) => blind.update({ state: 'stopped', position }),
});

document.body.append(blind.el);
