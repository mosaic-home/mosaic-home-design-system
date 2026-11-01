import { useState } from 'react';
import { TransformFields } from '@mosaic-home/design-system/react';
import type { ReferencePoint, TransformValue } from '@mosaic-home/design-system/web';

export function TransformFieldsExample() {
  const [value, setValue] = useState<TransformValue>({ x: 40, y: 30, width: 120, height: 80, angle: 12 });
  const [reference, setReference] = useState<ReferencePoint>('top-left');
  const [lockAspect, setLockAspect] = useState(false);
  const { x, y, width, height, angle } = value;
  return (
    <>
      <TransformFields
        label="Picture frame"
        value={value}
        reference={reference}
        lockAspect={lockAspect}
        onChange={setValue}
        onReferenceChange={setReference}
        onLockAspectChange={setLockAspect}
      />
      <div style={{ position: 'relative', width: 280, height: 200, background: 'var(--mh-input)' }}>
        <div
          style={{ position: 'absolute', left: x, top: y, width, height, transform: `rotate(${angle}deg)`, border: '2px solid var(--mh-accent)' }}
        />
      </div>
    </>
  );
}
