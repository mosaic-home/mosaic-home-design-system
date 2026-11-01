import { createCheckbox } from '@mosaic-home/design-system/web';

const rooms = ['Living room', 'Kitchen', 'Bedroom'];

const all = createCheckbox({
  label: 'All rooms',
  onChange: (checked) => {
    for (const box of boxes) box.setChecked(checked);
  },
});

const boxes = rooms.map((room, i) => createCheckbox({ label: room, checked: i === 1, onChange: syncAll }));

// "All rooms" is checked when every room is, and indeterminate when only some are.
function syncAll(): void {
  const count = boxes.filter((box) => box.input.checked).length;
  all.setChecked(count === boxes.length);
  all.setIndeterminate(count > 0 && count < boxes.length);
}

syncAll();
document.body.append(all.el, ...boxes.map((box) => box.el));
