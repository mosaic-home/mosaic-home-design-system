import { createButton, createCard, createText } from '@mosaic-home/design-system/web';

const summary = createText('21.5° and 46% humidity. The blinds close at 20:00.', { tone: 'muted' });
const allOff = createButton({
  label: 'All off',
  variant: 'text',
  size: 'small',
  onClick: () => card.setSubtitle('All lights off'),
});
const open = createButton({ label: 'Open', size: 'small' });

const card = createCard({
  title: 'Living room',
  subtitle: '3 lights on',
  icon: 'home',
  body: summary,
  footer: [allOff.el, open.el],
});

document.body.append(card.el);
