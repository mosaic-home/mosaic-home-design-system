import { createCard, createScreen, createStack, createText } from '@mosaic-home/design-system/web';

const header = createStack(
  { gap: 'xxs' },
  createText('Living room', { variant: 'eyebrow', tone: 'muted' }),
  createText('Good evening', { variant: 'headline' }),
);

const screen = createScreen(
  { width: 'medium', label: 'Home', header: header.el },
  createCard({ title: 'Climate', body: createText('21.5° and 46% humidity.', { tone: 'muted' }) }).el,
  createCard({ title: 'Lights', body: createText('Kitchen light and 2 others are on.', { tone: 'muted' }) }).el,
);

document.body.append(screen.el);
