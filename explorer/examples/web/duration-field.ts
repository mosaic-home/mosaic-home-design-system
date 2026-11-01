import { createDurationField, formatDuration } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const timer = createDurationField({
  label: 'Timer',
  value: 1500,
  presets: [300, 600, 900, 1800, 3600],
  max: 4 * 3600,
  helper: 'Try 90, 1h 30 or 0:45. A number alone is minutes.',
  onChange: (seconds) => (status.textContent = seconds === null ? 'No timer.' : `Timer: ${formatDuration(seconds, 'long')}`),
});

document.body.append(timer.el, status);
