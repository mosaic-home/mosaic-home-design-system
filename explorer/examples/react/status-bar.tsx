import { useState } from 'react';
import { StatusBar } from '@mosaic-home/design-system/react';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function StatusBarExample() {
  const [synced, setSynced] = useState(now);
  return (
    <StatusBar
      label="Hub status"
      items={[
        { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
        { id: 'devices', label: 'Devices', value: '24' },
        { id: 'time', label: 'Synced', value: synced, end: true, announce: true },
        { id: 'sync', label: 'Sync now', icon: 'refresh', end: true, onClick: () => setSynced(now()) },
      ]}
    />
  );
}
