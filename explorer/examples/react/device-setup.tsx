import { useState } from 'react';
import { DeviceSetup } from '@mosaic-home/design-system/react';
import type { DeviceSetupResult, DeviceSetupValues } from '@mosaic-home/design-system/web';

async function testServer({ address, token }: DeviceSetupValues): Promise<DeviceSetupResult> {
  try {
    const response = await fetch(address, { headers: { Authorization: `Bearer ${token}` } });
    if (response.status === 401 || response.status === 403) {
      return { ok: false, field: 'token', message: 'The server refused that token' };
    }
    return response.ok ? { ok: true } : { ok: false, message: `The server answered ${response.status}` };
  } catch {
    return { ok: false, field: 'address', message: 'No server answered at that address' };
  }
}

export function DeviceSetupExample() {
  const [server, setServer] = useState<string | null>(null);
  if (server) return <p>Connected to {server}</p>;
  return (
    <DeviceSetup
      placeholder="http://homeassistant.local:8123"
      intro="This screen talks to your home server directly."
      onTest={testServer}
      onFinish={({ address }) => setServer(address)}
    />
  );
}
