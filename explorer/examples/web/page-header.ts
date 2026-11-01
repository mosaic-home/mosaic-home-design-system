import { createIconButton, createPageHeader } from '@mosaic-home/design-system/web';

const allOff = createIconButton({
  icon: 'power',
  label: 'Turn off all lights',
  onClick: () => header.setSubtitle('All lights off'),
});

const header = createPageHeader({
  eyebrow: 'Ground floor',
  title: 'Living room',
  subtitle: '3 lights on',
  back: { label: 'Back to rooms', onClick: () => history.back() },
  actions: [allOff.el],
});

document.body.append(header.el);
