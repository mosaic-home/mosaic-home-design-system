import { createNavRail } from '@mosaic-home/design-system/web';

const rail = createNavRail({
  label: 'Main',
  value: 'home',
  items: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'lights', label: 'Lights', icon: 'lightbulb', iconSelected: 'lightbulb-on' },
    { id: 'media', label: 'Media', icon: 'music' },
    { id: 'alerts', label: 'Alerts', icon: 'bell', badge: 3, badgeLabel: '3 unread' },
  ],
  footerItems: [{ id: 'settings', label: 'Settings', icon: 'settings' }],
  onChange: (id) => {
    // Opening the alerts marks them read.
    if (id === 'alerts') rail.setBadge('alerts', null);
  },
});

document.body.append(rail.el);
