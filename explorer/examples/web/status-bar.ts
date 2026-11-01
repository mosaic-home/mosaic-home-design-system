import { createStatusBar } from '@mosaic-home/design-system/web';

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const bar = createStatusBar({
  label: 'Hub status',
  items: [
    { id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' },
    { id: 'devices', label: 'Devices', value: '24' },
    { id: 'time', label: 'Synced', value: now(), end: true, announce: true },
    {
      id: 'sync',
      label: 'Sync now',
      icon: 'refresh',
      end: true,
      onClick: () => bar.setItem('time', { value: now() }),
    },
  ],
});

document.body.append(bar.el);
