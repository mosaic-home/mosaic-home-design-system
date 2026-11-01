import { createIconButton } from '@mosaic-home/design-system/web';

let muted = false;

const mute = createIconButton({
  icon: 'volume-high',
  label: 'Mute',
  pressed: muted,
  onClick: () => {
    muted = !muted;
    mute.setPressed(muted);
    mute.setIcon(muted ? 'volume-off' : 'volume-high');
  },
});

document.body.append(mute.el);
