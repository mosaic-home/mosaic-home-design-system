import { createStatTile, createTile, createTileGrid } from '@mosaic-home/design-system/web';

const light = (label: string, on: boolean): HTMLElement => {
  const tile = createTile({
    icon: 'lightbulb',
    iconOn: 'lightbulb-on',
    label,
    state: on ? 'On' : 'Off',
    on,
    onToggle: (next) => tile.setState(next ? 'On' : 'Off'),
  });
  return tile.el;
};

const temperature = createStatTile({
  label: 'Temperature',
  icon: 'thermometer',
  value: '21.5',
  unit: '°C',
  trend: 'up',
  caption: 'Since 07:00',
});

const grid = createTileGrid([light('Kitchen', true), light('Living room', false), temperature.el], {
  label: 'Living room',
});

document.body.append(grid.el);
