import { useState } from 'react';
import { ColorPicker } from '@mosaic-home/design-system/react';

export function ColorPickerExample() {
  const [color, setColor] = useState('#ff9a3c');
  return (
    <>
      {/* onInput follows every drag; onChange fires once the user lets go. */}
      <ColorPicker label="Lamp colour" value={color} onInput={setColor} />
      <div style={{ width: 48, height: 48, borderRadius: 'var(--mh-radius-control)', background: color }} />
    </>
  );
}
