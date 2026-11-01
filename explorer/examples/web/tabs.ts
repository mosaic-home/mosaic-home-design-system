import { createTabs } from '@mosaic-home/design-system/web';

const tabs = createTabs({
  label: 'Thermostat',
  value: location.hash.slice(1) || 'overview',
  tabs: [
    { id: 'overview', label: 'Overview', panel: 'Currently 20.5°, heating to 21°.' },
    { id: 'schedule', label: 'Schedule', panel: 'Weekdays 06:30 to 22:00 at 21°.' },
    { id: 'history', label: 'History', badge: 3, panel: 'Three changes today.' },
  ],
  // Keeps the chosen tab in the address, so a reload opens the same one.
  onChange: (id) => history.replaceState(null, '', `#${id}`),
});

document.body.append(tabs.el);
