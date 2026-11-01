import { useState } from 'react';
import { MenuBar } from '@mosaic-home/design-system/react';
import type { MenuBarMenu } from '@mosaic-home/design-system/web';

// Defined once: the menu bar rebuilds whenever `menus` changes.
const MENUS: MenuBarMenu[] = [
  {
    label: 'File',
    items: [
      { value: 'new', label: 'New plan', shortcut: 'Ctrl+N' },
      { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
      { separator: true },
      { value: 'delete', label: 'Delete plan', danger: true },
    ],
  },
  { label: 'Edit', items: [{ value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' }, { value: 'redo', label: 'Redo' }] },
  { label: 'View', items: [{ value: 'grid', label: 'Show grid', checked: true }] },
];

export function MenuBarExample() {
  const [grid, setGrid] = useState(true);
  const select = (value: string, checked?: boolean) => {
    if (value === 'grid') setGrid(Boolean(checked));
  };
  return (
    <div>
      <MenuBar label="Floor plan editor" menus={MENUS} onSelect={select} />
      <p>Grid {grid ? 'shown' : 'hidden'}</p>
    </div>
  );
}
