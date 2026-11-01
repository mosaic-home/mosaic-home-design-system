import { createRecordingPill, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' }, 'Recording');

// Stands in for the microphone's input level (0–1).
const levels = setInterval(() => pill.setLevel(Math.random()), 120);

const pill = createRecordingPill({
  onPauseToggle: (paused) => (status.textContent = paused ? 'Paused' : 'Recording'),
  onStop: () => {
    clearInterval(levels);
    status.textContent = `Saved a ${pill.elapsed} second note`;
    pill.destroy();
    pill.el.remove();
  },
});

document.body.append(pill.el, status);
