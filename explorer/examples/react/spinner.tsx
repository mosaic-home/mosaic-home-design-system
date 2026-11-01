import { useEffect, useState } from 'react';
import { Spinner } from '@mosaic-home/design-system/react';

export function SpinnerExample() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div aria-live="polite">
      {loaded ? <p>Living room, Kitchen, Bedroom and Garden are ready.</p> : <Spinner size="large" label="Loading rooms" />}
    </div>
  );
}
