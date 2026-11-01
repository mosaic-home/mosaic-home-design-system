import { useState } from 'react';
import { mdiBed, mdiGarage, mdiSofaOutline, mdiStove } from '@mdi/js';
import { IconPicker } from '@mosaic-home/design-system/react';
import { iconLabel, type IconPickerItem } from '@mosaic-home/design-system/web';

const roomIcons: (string | IconPickerItem)[] = [
  { name: 'sofa', path: mdiSofaOutline, label: 'Living room', keywords: ['lounge'] },
  { name: 'bed', path: mdiBed, label: 'Bedroom', keywords: ['sleep'] },
  { name: 'kitchen', path: mdiStove, label: 'Kitchen', keywords: ['cook'] },
  { name: 'garage', path: mdiGarage, label: 'Garage', keywords: ['car'] },
  'lightbulb',
  'fan',
];

export function IconPickerExample() {
  const [icon, setIcon] = useState<string | null>('sofa');
  return (
    <>
      <IconPicker label="Room icon" allowNone icons={roomIcons} value={icon} onChange={setIcon} />
      <p>{icon ? `Picked ${iconLabel(icon)}.` : 'No icon.'}</p>
    </>
  );
}
