import { useState } from 'react';
import { RadialDial } from '@mosaic-home/design-system/react';

export function RadialDialExample() {
  const [volume, setVolume] = useState(35);
  return <RadialDial label="Volume" ticks={11} format={(v) => `${v}%`} value={volume} onValueChange={setVolume} />;
}
