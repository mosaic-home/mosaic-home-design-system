import { createText, createTree, type TreeNode } from '@mosaic-home/design-system/web';

const nodes: TreeNode[] = [
  {
    id: 'ground',
    label: 'Ground floor',
    icon: 'home',
    children: [
      { id: 'living', label: 'Living room', meta: '4 devices' },
      { id: 'kitchen', label: 'Kitchen', meta: '3 devices' },
    ],
  },
  { id: 'upstairs', label: 'Upstairs', icon: 'home', children: [{ id: 'bedroom', label: 'Bedroom' }] },
];

const picked = createText('Selected: kitchen', { variant: 'caption', tone: 'muted' });

const tree = createTree({
  nodes,
  label: 'Rooms',
  expanded: ['ground'],
  selected: 'kitchen',
  onSelect: (id) => (picked.textContent = `Selected: ${id}`),
});

document.body.append(tree.el, picked);
