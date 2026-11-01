import { useEffect, useState } from 'react';
import { Skeleton } from '@mosaic-home/design-system/react';

export function SkeletonExample() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (!loaded) return <Skeleton lines={3} label="Loading the forecast" />;
  return (
    <div>
      <h3>Tomorrow</h3>
      <p>Light rain in the morning, clearing by noon.</p>
      <p>High of 17°, low of 9°.</p>
    </div>
  );
}
