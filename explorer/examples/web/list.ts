import { createList, type ListItemOptions } from '@mosaic-home/design-system/web';

const lights = [
  { name: 'Kitchen light', on: true },
  { name: 'Hallway', on: false },
  { name: 'Desk lamp', on: true },
];

const rows = (): ListItemOptions[] =>
  lights.map((light) => ({
    title: light.name,
    icon: light.on ? 'lightbulb-on' : 'lightbulb',
    trailing: light.on ? 'On' : 'Off',
    onClick: () => {
      light.on = !light.on;
      list.setItems(rows());
    },
  }));

const list = createList({ label: 'Lights', inset: true, items: rows() });

document.body.append(list.el);
