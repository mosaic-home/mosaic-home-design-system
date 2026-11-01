import { useState } from 'react';
import { GradientEditor } from '@mosaic-home/design-system/react';
import { gradientCss, type GradientStop } from '@mosaic-home/design-system/web';

export function GradientEditorExample() {
  const [stops, setStops] = useState<GradientStop[]>([
    { offset: 0, color: '#1a1446' },
    { offset: 40, color: '#c2457a' },
    { offset: 100, color: '#ffb35c' },
  ]);
  const [angle, setAngle] = useState(90);
  return (
    <>
      <div style={{ height: 96, borderRadius: 'var(--mh-radius-lg)', background: gradientCss(stops, angle) }} />
      <GradientEditor
        label="Sunrise light"
        showAngle
        stops={stops}
        angle={angle}
        onInput={(next, nextAngle) => {
          setStops(next);
          setAngle(nextAngle);
        }}
      />
    </>
  );
}
