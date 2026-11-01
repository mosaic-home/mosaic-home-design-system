import { useState } from 'react';
import { CompareSlider, Text } from '@mosaic-home/design-system/react';

export function CompareSliderExample() {
  const [split, setSplit] = useState(45);
  return (
    <>
      <CompareSlider
        label="Compare the lighting scene"
        before={{ src: 'photos/living-room-off.jpg', alt: 'Living room with the lights off' }}
        after={{ src: 'photos/living-room-evening.jpg', alt: 'Living room with the evening scene on' }}
        beforeLabel="Off"
        afterLabel="Evening"
        value={split}
        onChange={setSplit}
      />
      <Text variant="caption" tone="muted">
        Showing {Math.round(split)}% of the evening scene
      </Text>
    </>
  );
}
