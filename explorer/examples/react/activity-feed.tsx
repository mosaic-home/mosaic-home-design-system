import { useState } from 'react';
import { mdiDoorOpen, mdiLightbulbOutline, mdiLockOutline, mdiThermostat } from '@mdi/js';
import { ActivityFeed } from '@mosaic-home/design-system/react';
import type { ActivityItem } from '@mosaic-home/design-system/web';

const ago = (minutes: number): number => Date.now() - minutes * 60_000;

export function ActivityFeedExample() {
  const [items, setItems] = useState<ActivityItem[]>(() => [
    { id: '1', title: 'Back door opened', by: 'Robin', time: ago(1), icon: mdiDoorOpen, tone: 'accent' },
    { id: '2', title: 'Heating set to 21 °C', by: 'Evening routine', time: ago(14), icon: mdiThermostat },
    { id: '3', title: 'Hall light turned on', by: 'Motion', time: ago(52), icon: mdiLightbulbOutline },
  ]);
  const [hasOlder, setHasOlder] = useState(true);
  const loadOlder = () => {
    const older: ActivityItem = { id: '4', title: 'Front door locked', time: ago(60 * 26), icon: mdiLockOutline };
    setItems((list) => [...list, older]);
    setHasOlder(false);
  };
  return (
    <ActivityFeed
      items={items}
      onSelect={(id) => location.assign(`#/activity/${id}`)}
      onMore={hasOlder ? loadOlder : undefined}
    />
  );
}
