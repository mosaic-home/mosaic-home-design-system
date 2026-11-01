import { useState } from 'react';
import { Tree } from '@mosaic-home/design-system/react';
import type { TreeNode } from '@mosaic-home/design-system/web';

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

export function TreeExample() {
  const [expanded, setExpanded] = useState<string[]>(['ground']);
  const [selected, setSelected] = useState<string | null>('kitchen');
  return (
    <Tree
      nodes={nodes}
      label="Rooms"
      expanded={expanded}
      onExpandedChange={setExpanded}
      selected={selected}
      onSelect={setSelected}
    />
  );
}
