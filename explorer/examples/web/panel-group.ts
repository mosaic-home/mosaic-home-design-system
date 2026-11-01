import { createIconButton, createPanelGroup, createText } from '@mosaic-home/design-system/web';

const refresh = createIconButton({ icon: 'refresh', label: 'Refresh' });

const dock = createPanelGroup({
  label: 'Diagnostics',
  panels: [
    { id: 'events', label: 'Events', icon: 'bell', badge: 2, content: createText('Motion in the hall at 14:02.') },
    { id: 'devices', label: 'Devices', icon: 'wifi', content: createText('12 devices online, 1 asleep.') },
    { id: 'logs', label: 'Logs', icon: 'info', content: createText('Heartbeat at 14:05.', { variant: 'mono' }) },
  ],
  value: 'events',
  actions: [refresh.el],
  collapsible: true,
  onChange: (id) => refresh.setDisabled(id === 'logs'),
});

document.body.append(dock.el);
