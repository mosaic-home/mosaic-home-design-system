import { useState } from 'react';
import { mdiFormatText, mdiImageOutline } from '@mdi/js';
import { LayersPanel } from '@mosaic-home/design-system/react';
import { updateLayer, type LayerItem } from '@mosaic-home/design-system/web';

const LAYERS: LayerItem[] = [
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

export function LayersPanelExample() {
  const [layers, setLayers] = useState(LAYERS);
  const [selected, setSelected] = useState<string | null>('tree');
  return (
    <LayersPanel
      label="Layers"
      layers={layers}
      selected={selected}
      onSelect={setSelected}
      onVisibleChange={(id, visible) => setLayers((list) => updateLayer(list, id, { visible }))}
      onLockedChange={(id, locked) => setLayers((list) => updateLayer(list, id, { locked }))}
      onExpandedChange={(id, expanded) => setLayers((list) => updateLayer(list, id, { expanded }))}
      onReorder={(_id, _parent, _index, next) => setLayers(next)}
    />
  );
}
