import { useState } from 'react';
import { Tabs } from '@mosaic-home/design-system/react';

const TABS = [
  { id: 'overview', label: 'Overview', panel: <p>Currently 20.5°, heating to 21°.</p> },
  { id: 'schedule', label: 'Schedule', panel: <p>Weekdays 06:30 to 22:00 at 21°.</p> },
  { id: 'history', label: 'History', badge: 3, panel: <p>Three changes today.</p> },
];

export function TabsExample() {
  const [tab, setTab] = useState('overview');
  return <Tabs label="Thermostat" tabs={TABS} value={tab} onChange={setTab} />;
}
