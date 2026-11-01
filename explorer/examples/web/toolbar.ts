import { createButton, createIconButton, createToolbar } from '@mosaic-home/design-system/web';

let editing = false;
const edit = createIconButton({
  icon: 'edit',
  label: 'Edit room',
  pressed: editing,
  onClick: () => {
    editing = !editing;
    edit.setPressed(editing);
  },
});

const toolbar = createToolbar({
  label: 'Floor plan',
  items: [
    createIconButton({ icon: 'arrow-left', label: 'Undo' }).el,
    createIconButton({ icon: 'arrow-right', label: 'Redo' }).el,
    'separator',
    createIconButton({ icon: 'add', label: 'Add device' }).el,
    edit.el,
    'spacer',
    createButton({ label: 'Done', size: 'small' }).el,
  ],
});

document.body.append(toolbar.el);
