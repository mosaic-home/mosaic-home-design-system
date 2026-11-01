import { createSwitch } from '@mosaic-home/design-system/web';

const motion = createSwitch({
  row: true,
  icon: 'lightbulb',
  label: 'Motion lighting',
  description: 'Turn the lights on when someone walks in.',
  checked: true,
  onChange: (on) => afterSunset.setDisabled(!on),
});

const afterSunset = createSwitch({ row: true, icon: 'weather', label: 'Only after sunset' });

document.body.append(motion.el, afterSunset.el);
