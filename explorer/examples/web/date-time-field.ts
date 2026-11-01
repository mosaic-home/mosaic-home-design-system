import { createDateTimeField } from '@mosaic-home/design-system/web';

const wakeUp = createDateTimeField({
  label: 'Wake-up light',
  type: 'time',
  value: '06:45',
  step: 60,
  helper: 'The bedroom lamp starts to brighten at this time.',
  onChange: (value) => wakeUp.setError(value ? undefined : 'Choose a time.'),
});

document.body.append(wakeUp.el);
