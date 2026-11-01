import { createButtonGroup } from '@mosaic-home/design-system/web';

let range = 'week';

const group = createButtonGroup({
  label: 'Range',
  items: [
    { id: 'day', label: 'Day', pressed: false },
    { id: 'week', label: 'Week', pressed: true },
    { id: 'month', label: 'Month', pressed: false },
  ],
  onClick: (id) => {
    group.setPressed(range, false);
    group.setPressed(id, true);
    range = id;
  },
});

document.body.append(group.el);
