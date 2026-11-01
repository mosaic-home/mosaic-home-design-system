import { createBottomSheet, createButton, h } from '@mosaic-home/design-system/web';

const status = h('p', { 'aria-live': 'polite' });

const pick = (scene: string) => () => {
  status.textContent = `${scene} is on`;
  sheet.close();
};

const sheet = createBottomSheet({
  title: 'Quick scenes',
  description: 'Living room',
  content: h('p', {}, 'Pick a scene for the whole room.'),
  footer: [
    createButton({ label: 'Reading', variant: 'secondary', onClick: pick('Reading') }).el,
    createButton({ label: 'Film night', onClick: pick('Film night') }).el,
  ],
});

const open = createButton({ label: 'Scenes', icon: 'lightbulb-on', onClick: () => sheet.open() });

document.body.append(open.el, status);
