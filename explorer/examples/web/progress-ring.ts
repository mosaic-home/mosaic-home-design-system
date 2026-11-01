import { createButton, createProgressRing } from '@mosaic-home/design-system/web';

const total = 8;
let done = 3;

const ring = createProgressRing({ label: 'Rooms set up', value: done, max: total, valueText: `${done}/${total}`, size: 'large' });

const next = createButton({
  label: 'Set up next room',
  variant: 'secondary',
  onClick: () => {
    done = Math.min(total, done + 1);
    ring.setValue(done, `${done}/${total}`);
    if (done === total) next.setDisabled(true);
  },
});

document.body.append(ring.el, next.el);
