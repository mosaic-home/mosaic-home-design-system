import { useState } from 'react';
import { Button, CurvesEditor, Text } from '@mosaic-home/design-system/react';
import { curveLut, type CurvePoint } from '@mosaic-home/design-system/web';

const start: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 0.25, y: 0.2 },
  { x: 0.75, y: 0.82 },
  { x: 1, y: 1 },
];

export function CurvesEditorExample() {
  const [points, setPoints] = useState(start);
  const midtones = curveLut(points, 3)[1] ?? 0.5;
  return (
    <>
      <CurvesEditor points={points} label="Tone curve" onChange={setPoints} />
      <Text variant="caption" tone="muted">
        {points.length} points · midtones {Math.round(midtones * 255)}
      </Text>
      <Button variant="secondary" size="small" onClick={() => setPoints(start)}>
        Reset
      </Button>
    </>
  );
}
