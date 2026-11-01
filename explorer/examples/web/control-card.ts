import { createControlCard, createSwitch } from '@mosaic-home/design-system/web';

let on = true;
const stateText = () => (on ? 'On · 70%' : 'Off');

const power = createSwitch({
  ariaLabel: 'Desk lamp power',
  checked: on,
  onChange: (checked) => {
    on = checked;
    card.update({ active: on, state: stateText() });
  },
});

const card = createControlCard({
  title: 'Desk lamp',
  icon: 'lightbulb',
  tone: 'warm',
  active: on,
  state: stateText(),
  control: power.el,
});

document.body.append(card.el);
