import { useState } from 'react';
import { IconButton, PanelGroup, Text } from '@mosaic-home/design-system/react';

export function PanelGroupExample() {
  const [tab, setTab] = useState('events');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <PanelGroup
      label="Diagnostics"
      panels={[
        { id: 'events', label: 'Events', icon: 'bell', badge: 2, content: <Text>Motion in the hall at 14:02.</Text> },
        { id: 'devices', label: 'Devices', icon: 'wifi', content: <Text>12 devices online, 1 asleep.</Text> },
        { id: 'logs', label: 'Logs', icon: 'info', content: <Text variant="mono">Heartbeat at 14:05.</Text> },
      ]}
      value={tab}
      onChange={setTab}
      actions={<IconButton icon="refresh" label="Refresh" disabled={tab === 'logs'} />}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
    />
  );
}
