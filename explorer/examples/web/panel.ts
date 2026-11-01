import { createButton, createIconButton, createPanel, createSwitch } from '@mosaic-home/design-system/web';

const lights = [
  createSwitch({ label: 'Ceiling', row: true, checked: true }),
  createSwitch({ label: 'Floor lamp', row: true }),
];

const allOff = createButton({
  label: 'All off',
  variant: 'secondary',
  size: 'small',
  onClick: () => lights.forEach((light) => light.setChecked(false)),
});

const panel = createPanel({
  title: 'Lights',
  icon: 'lightbulb',
  description: 'Living room',
  actions: [createIconButton({ icon: 'more', label: 'Light options' }).el],
  body: lights.map((light) => light.el),
  footer: [allOff.el],
});

document.body.append(panel.el);
