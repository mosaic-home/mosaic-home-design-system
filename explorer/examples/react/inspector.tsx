import { useState } from 'react';
import { Inspector } from '@mosaic-home/design-system/react';
import type { InspectorSection } from '@mosaic-home/design-system/web';

export function InspectorExample() {
  const [scale, setScale] = useState(100);
  const [opacity, setOpacity] = useState(85);
  const [shadow, setShadow] = useState(true);
  const sections: InspectorSection[] = [
    {
      id: 'transform',
      title: 'Transform',
      params: [
        { id: 'scale', kind: 'slider', label: 'Scale', value: scale, max: 400, unit: '%', keyframe: 'off' },
        { id: 'opacity', kind: 'slider', label: 'Opacity', value: opacity, unit: '%', keyframe: 'on' },
      ],
    },
    { id: 'look', title: 'Look', params: [{ id: 'shadow', kind: 'toggle', label: 'Drop shadow', value: shadow }] },
  ];
  return (
    <Inspector
      label="Clip properties"
      sections={sections}
      onChange={(id, value) => {
        if (id === 'scale') setScale(Number(value));
        if (id === 'opacity') setOpacity(Number(value));
        if (id === 'shadow') setShadow(Boolean(value));
      }}
    />
  );
}
