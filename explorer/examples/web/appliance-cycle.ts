import { createApplianceCycle, type ApplianceState } from '@mosaic-home/design-system/web';

const duration = 5400;
let remaining = 4320;
let state: ApplianceState = 'running';

const set = (next: ApplianceState): void => {
  state = next;
  cycle.update({ state });
};

const cycle = createApplianceCycle({
  name: 'Washing machine',
  state,
  programme: 'Cotton 40°',
  stages: ['Wash', 'Rinse', 'Spin'],
  stage: 0,
  remaining,
  duration,
  endsAt: 'Ends 14:20',
  onPause: () => set('paused'),
  onResume: () => set('running'),
  onDismiss: () => cycle.el.remove(),
});

setInterval(() => {
  if (state !== 'running') return;
  remaining = Math.max(0, remaining - 60);
  if (remaining === 0) set('finished');
  else cycle.update({ remaining, stage: Math.floor(((duration - remaining) / duration) * 3) });
}, 60_000);

document.body.append(cycle.el);
