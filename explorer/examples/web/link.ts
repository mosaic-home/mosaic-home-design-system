import { createLink } from '@mosaic-home/design-system/web';

const help = createLink({ text: 'how sensors report', href: 'https://example.com/sensors', external: true });

// Without an href the link renders a button: an action that looks like a link.
const more = createLink({
  text: 'Show three more devices',
  onClick: () => more.setText('All devices shown'),
});

const note = document.createElement('p');
note.append('The hallway sensor reports every five minutes. Read ', help.el, '. ', more.el);

document.body.append(note);
