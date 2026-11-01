import { useState } from 'react';
import { NavRail } from '@mosaic-home/design-system/react';

const SETTINGS = [{ id: 'settings', label: 'Settings', icon: 'settings' }];

export function NavRailExample() {
  const [page, setPage] = useState('home');
  const [unread, setUnread] = useState(3);
  const open = (id: string) => {
    setPage(id);
    if (id === 'alerts') setUnread(0);
  };
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'lights', label: 'Lights', icon: 'lightbulb', iconSelected: 'lightbulb-on' },
    { id: 'media', label: 'Media', icon: 'music' },
    { id: 'alerts', label: 'Alerts', icon: 'bell', badge: unread || null, badgeLabel: `${unread} unread` },
  ];
  return <NavRail label="Main" items={items} footerItems={SETTINGS} value={page} onChange={open} />;
}
