import { createMenuBar } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const menuBar = createMenuBar({
  label: 'Floor plan editor',
  menus: [
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
  ],
  // For a checkable item, `checked` is its new state.
  onSelect: (value, checked) => (status.textContent = checked === undefined ? value : `${value}: ${checked}`),
});

document.body.append(menuBar.el, status);
