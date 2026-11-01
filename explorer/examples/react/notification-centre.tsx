import { useState } from 'react';
import { mdiDoorOpen, mdiWashingMachine, mdiWaterAlert } from '@mdi/js';
import { NotificationCentre } from '@mosaic-home/design-system/react';
import type { NotificationItem } from '@mosaic-home/design-system/web';

export function NotificationCentreExample() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'leak',
      title: 'Water under the kitchen sink',
      message: 'The leak sensor has been wet for 2 minutes.',
      priority: 'critical',
      icon: mdiWaterAlert,
      time: 'Now',
      actions: [{ id: 'valve', label: 'Close main valve', tone: 'primary' }],
    },
    { id: 'door', title: 'Back door left open', group: 'Security', icon: mdiDoorOpen, time: '10 min' },
    { id: 'washer', title: 'Washing finished', group: 'Appliances', icon: mdiWashingMachine, time: '12 min' },
  ]);
  const without = (ids: string[]) => setNotifications((list) => list.filter((n) => !ids.includes(n.id)));
  return (
    <NotificationCentre
      notifications={notifications}
      onAction={(id) => without([id])}
      onDismiss={(id) => without([id])}
      onClearAll={without}
    />
  );
}
