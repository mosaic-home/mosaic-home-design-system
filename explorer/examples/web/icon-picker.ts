import { mdiBed, mdiGarage, mdiSofaOutline, mdiStove } from '@mdi/js';
import { createIconPicker, iconLabel } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const picker = createIconPicker({
  label: 'Room icon',
  value: 'sofa',
  allowNone: true,
  icons: [
    { name: 'sofa', path: mdiSofaOutline, label: 'Living room', keywords: ['lounge'] },
    { name: 'bed', path: mdiBed, label: 'Bedroom', keywords: ['sleep'] },
    { name: 'kitchen', path: mdiStove, label: 'Kitchen', keywords: ['cook'] },
    { name: 'garage', path: mdiGarage, label: 'Garage', keywords: ['car'] },
    'lightbulb',
    'fan',
  ],
  onChange: (name) => (status.textContent = name ? `Picked ${iconLabel(name)}.` : 'No icon.'),
});

document.body.append(picker.el, status);
