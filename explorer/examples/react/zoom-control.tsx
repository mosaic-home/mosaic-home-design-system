import { useState } from 'react';
import { ZoomControl } from '@mosaic-home/design-system/react';

// The level that fits the picture in its frame, worked out by the app.
const FIT_LEVEL = 0.63;

export function ZoomControlExample() {
  const [zoom, setZoom] = useState(1);
  const [fitted, setFitted] = useState(false);
  const change = (value: number) => {
    setZoom(value);
    setFitted(false);
  };
  const fit = () => {
    setZoom(FIT_LEVEL);
    setFitted(true);
  };
  return <ZoomControl value={zoom} min={0.25} max={8} fitted={fitted} onChange={change} onFit={fit} />;
}
