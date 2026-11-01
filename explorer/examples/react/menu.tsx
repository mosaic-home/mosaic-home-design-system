import { useState } from 'react';
import { IconButton, Menu } from '@mosaic-home/design-system/react';
import type { MenuEntry } from '@mosaic-home/design-system/web';

const items: MenuEntry[] = [
  { value: 'edit', label: 'Edit', icon: 'edit', shortcut: 'E' },
  { value: 'duplicate', label: 'Duplicate', icon: 'copy', shortcut: 'Ctrl+D' },
  { value: 'share', label: 'Share', icon: 'share' },
  { separator: true },
  { value: 'delete', label: 'Delete', icon: 'delete', danger: true },
];

export function MenuExample() {
  const [chosen, setChosen] = useState('');
  return (
    <>
      <Menu items={items} onSelect={setChosen}>
        <IconButton icon="more" label="Scene actions" />
      </Menu>
      <p aria-live="polite">{chosen && `Chosen: ${chosen}`}</p>
    </>
  );
}
