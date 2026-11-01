import { createAppShell, createCard, createIconButton, createStatusBar, h } from '@mosaic-home/design-system/web';

const sections = [
  { label: 'Home', icon: 'home' },
  { label: 'Lights', icon: 'lightbulb' },
  { label: 'Climate', icon: 'thermometer' },
];
const nav = h('nav', { 'aria-label': 'Sections' });

const shell = createAppShell(
  {
    title: 'Home',
    subtitle: 'Living room',
    actions: [createIconButton({ icon: 'search', label: 'Search' }).el],
    nav,
    navPosition: 'auto',
    status: createStatusBar({ items: [{ id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' }] }).el,
  },
  createCard({ title: 'Climate', body: '21.5° and 46% humidity.' }).el,
  createCard({ title: 'Lights', body: 'Kitchen light and 2 others are on.' }).el,
);

const tabs = sections.map(({ label, icon }, i) =>
  createIconButton({
    icon,
    label,
    pressed: i === 0,
    onClick: () => {
      tabs.forEach((tab, j) => tab.setPressed(j === i));
      shell.setTitle(label);
    },
  }),
);
nav.append(...tabs.map((tab) => tab.el));

document.body.append(shell.el);
