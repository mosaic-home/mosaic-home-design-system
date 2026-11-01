import { createBadge, createPropertyList, type PropertyListItem } from '@mosaic-home/design-system/web';

const details = (minutesLeft: number): PropertyListItem[] => [
  { label: 'Status', value: createBadge({ label: 'Printing', tone: 'accent' }).el },
  { label: 'Time left', value: `${minutesLeft} min` },
  { label: 'Nozzle', value: '215 °C' },
  { label: 'File', value: 'shelf_bracket_v2.gcode' },
];

let minutesLeft = 78;
const printer = createPropertyList({ items: details(minutesLeft) });

setInterval(() => {
  minutesLeft = Math.max(0, minutesLeft - 1);
  printer.setItems(details(minutesLeft));
}, 60_000);

document.body.append(printer.el);
