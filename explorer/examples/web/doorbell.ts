import { createButton, createDoorbell, type DoorbellHandle } from '@mosaic-home/design-system/web';

let bell: DoorbellHandle | null = null;

const close = () => {
  bell?.destroy();
  bell?.el.remove();
  bell = null;
  ring.el.focus();
};

// In an app this runs when the doorbell rings.
const ring = createButton({
  label: 'Ring the doorbell',
  icon: 'bell',
  onClick: () => {
    const handle = createDoorbell({
      door: 'Front door',
      visitor: 'Parcel delivery',
      when: 'Just now',
      src: '/snapshots/front-door.jpg',
      // Covers the screen, keeps focus inside and closes with Escape.
      takeover: true,
      onAnswer: () => handle.update({ answered: true }),
      onTalk: (talking) => handle.update({ talking }),
      onDismiss: close,
    });
    bell = handle;
    document.body.append(handle.el);
    handle.focus();
  },
});

document.body.append(ring.el);
