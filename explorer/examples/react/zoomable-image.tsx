import { useState } from 'react';
import { Text, ZoomableImage } from '@mosaic-home/design-system/react';

export function ZoomableImageExample() {
  const [scale, setScale] = useState(1);
  return (
    <>
      <ZoomableImage
        src="plans/ground-floor.png"
        alt="Floor plan of the ground floor"
        controls
        aspect={16 / 10}
        onChange={(view) => setScale(view.scale)}
      />
      <Text variant="caption" tone="muted">
        {Math.round(scale * 100)}%
      </Text>
    </>
  );
}
