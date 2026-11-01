import { createHumidityControl } from '@mosaic-home/design-system/web';

const humidifier = createHumidityControl({
  label: 'Nursery humidity',
  current: 36,
  target: 45,
  on: true,
  action: 'humidifying',
  mode: 'normal',
  modes: [
    { value: 'normal', label: 'Normal' },
    { value: 'sleep', label: 'Sleep' },
  ],
  // Called once the taps settle, so one change is sent rather than one per tap.
  onTarget: (target) => humidifier.update({ target }),
  onMode: (mode) => humidifier.update({ mode }),
  onToggle: (on) => humidifier.update({ on, action: on ? 'humidifying' : 'off' }),
});

document.body.append(humidifier.el);
