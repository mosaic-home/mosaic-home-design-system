import { createButton, createEmptyState, h } from '@mosaic-home/design-system/web';

const lights: string[] = [];
const list = h('ul');

const addLight = createButton({
  label: 'Add light',
  icon: 'add',
  onClick: () => {
    lights.push(`Desk lamp ${lights.length + 1}`);
    list.replaceChildren(...lights.map((name) => h('li', {}, name)));
    empty.el.replaceWith(list);
  },
});

const empty = createEmptyState({
  icon: 'lightbulb',
  title: 'No lights yet',
  text: 'Add a light to control it from here.',
  action: addLight.el,
});

document.body.append(empty.el);
