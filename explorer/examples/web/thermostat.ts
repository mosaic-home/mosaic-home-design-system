import { createThermostat } from '@mosaic-home/design-system/web';

const thermostat = createThermostat({
  label: 'Living room thermostat',
  current: 19.5,
  target: 21,
  mode: 'heat',
  modes: [
    { value: 'off', label: 'Off' },
    { value: 'heat', label: 'Heat' },
    { value: 'cool', label: 'Cool' },
  ],
  action: 'heating',
  // Called once the taps settle, so one change is sent rather than one per tap.
  onTarget: (target) => {
    if (typeof target === 'number') thermostat.update({ target });
  },
  onMode: (mode) => thermostat.update({ mode, action: mode === 'off' ? 'off' : 'idle' }),
});

document.body.append(thermostat.el);
