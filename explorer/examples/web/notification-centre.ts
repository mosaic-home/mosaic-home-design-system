import { mdiDoorOpen, mdiWashingMachine, mdiWaterAlert } from '@mdi/js';
import { createNotificationCentre, type NotificationItem } from '@mosaic-home/design-system/web';

let notifications: NotificationItem[] = [
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
];

const without = (ids: string[]): void => {
  notifications = notifications.filter((n) => !ids.includes(n.id));
  centre.update({ notifications });
};

const centre = createNotificationCentre({
  notifications,
  onAction: (id) => without([id]),
  onDismiss: (id) => without([id]),
  onClearAll: without,
});

document.body.append(centre.el);
