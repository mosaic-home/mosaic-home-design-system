import { createNotice, h } from '@mosaic-home/design-system/web';

const answer = h('p', { 'aria-live': 'polite' });

const permission = createNotice({
  kind: 'permission',
  icon: 'microphone',
  title: 'Talk to your home',
  message: 'Allow microphone access to control lights and climate by voice.',
  points: ['Listens only while you hold the button', 'Turn it off any time in Settings'],
  actions: [
    { label: 'Allow microphone', primary: true, onClick: () => (answer.textContent = 'Allowed') },
    { label: 'Not now', dismisses: true, onClick: () => (answer.textContent = 'Asked again later') },
  ],
});

const tip = createNotice({
  kind: 'tip',
  message: 'Long-press a tile to change its size or move it to another room.',
  actions: [{ label: 'Got it', primary: true, dismisses: true }],
});

document.body.append(permission.el, answer, tip.el);
