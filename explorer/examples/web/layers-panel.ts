import { mdiFormatText, mdiImageOutline } from '@mdi/js';
import { createLayersPanel, createText, type LayerItem } from '@mosaic-home/design-system/web';

const layers: LayerItem[] = [
  { id: 'title', name: 'Title', icon: mdiFormatText },
  {
    id: 'scenery',
    name: 'Scenery',
    children: [
      { id: 'tree', name: 'Tree', icon: mdiImageOutline },
      { id: 'sun', name: 'Sun', icon: mdiImageOutline, visible: false },
    ],
  },
  { id: 'sky', name: 'Sky', icon: mdiImageOutline, locked: true },
];

const status = createText('Drag a grip, or press Up and Down on it, to reorder.', { variant: 'caption', tone: 'muted' });

const panel = createLayersPanel({
  label: 'Layers',
  layers,
  selected: 'tree',
  onSelect: (id) => (status.textContent = `Selected ${id}`),
  onVisibleChange: (id, visible) => (status.textContent = `${id} ${visible ? 'shown' : 'hidden'}`),
  onReorder: (id, parent, index) => (status.textContent = `${id} moved to ${index + 1}${parent ? ` in ${parent}` : ''}`),
});

document.body.append(panel.el, status);
