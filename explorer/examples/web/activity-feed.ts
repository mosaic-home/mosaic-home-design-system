import { mdiDoorOpen, mdiLightbulbOutline, mdiLockOutline, mdiThermostat } from '@mdi/js';
import { createActivityFeed, type ActivityItem } from '@mosaic-home/design-system/web';

const ago = (minutes: number): number => Date.now() - minutes * 60_000;

let items: ActivityItem[] = [
  { id: '1', title: 'Back door opened', by: 'Robin', time: ago(1), icon: mdiDoorOpen, tone: 'accent' },
  { id: '2', title: 'Heating set to 21 °C', by: 'Evening routine', time: ago(14), icon: mdiThermostat },
  { id: '3', title: 'Hall light turned on', by: 'Motion', time: ago(52), icon: mdiLightbulbOutline },
];

const older: ActivityItem = { id: '4', title: 'Front door locked', time: ago(60 * 26), icon: mdiLockOutline };

const feed = createActivityFeed({
  items,
  onSelect: (id) => location.assign(`#/activity/${id}`),
  onMore: () => {
    items = [...items, older];
    feed.update({ items, onMore: undefined });
  },
});

document.body.append(feed.el);
