import { createAlarmPanel } from '@mosaic-home/design-system/web';

const EXIT_DELAY = 30;
let exit: ReturnType<typeof setTimeout> | undefined;

const panel = createAlarmPanel({
  label: 'House alarm',
  state: 'disarmed',
  onArm: (mode) => {
    panel.update({ state: 'arming', mode, deadline: Date.now() + EXIT_DELAY * 1000, delay: EXIT_DELAY });
    exit = setTimeout(() => panel.update({ state: 'armed', deadline: null, delay: null }), EXIT_DELAY * 1000);
  },
  // The app checks the code; the panel only hands it over and clears it.
  onDisarm: (code) => {
    if (code !== '1234') {
      panel.update({ error: 'Wrong code' });
      return;
    }
    clearTimeout(exit);
    panel.update({ state: 'disarmed', deadline: null, delay: null, error: null });
  },
});

document.body.append(panel.el);
