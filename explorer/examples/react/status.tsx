import { useEffect, useState } from 'react';
import { Status } from '@mosaic-home/design-system/react';

export function StatusExample() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  // `announce` reads changes out to screen readers.
  return <Status state={online ? 'online' : 'offline'} announce />;
}
