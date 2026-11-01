import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@mosaic-home/design-system/react';
import type { ConnectionState } from '@mosaic-home/design-system/web';

export function ConnectionStatusExample() {
  const [state, setState] = useState<ConnectionState>('connecting');
  const [retryAt, setRetryAt] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let retry: ReturnType<typeof setTimeout> | undefined;
    const socket = new WebSocket('ws://homeassistant.local:8123/socket');
    socket.onopen = () => setState('connected');
    socket.onclose = () => {
      setState('reconnecting');
      setRetryAt(Date.now() + 10_000);
      retry = setTimeout(() => setAttempt((n) => n + 1), 10_000);
    };
    return () => {
      clearTimeout(retry);
      socket.onclose = null;
      socket.close();
    };
  }, [attempt]);

  const retryNow = () => {
    setState('connecting');
    setRetryAt(null);
    setAttempt((n) => n + 1);
  };
  return (
    <ConnectionStatus
      state={state}
      server="homeassistant.local"
      variant="banner"
      retryAt={retryAt}
      onRetry={retryNow}
    />
  );
}
