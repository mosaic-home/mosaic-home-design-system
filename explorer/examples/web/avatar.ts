import { createAvatar, createAvatarGroup } from '@mosaic-home/design-system/web';

const owner = createAvatar({ name: 'Ada Brook', size: 'large', status: 'online' });

const people = createAvatarGroup({
  label: 'People at home',
  max: 3,
  avatars: [{ name: 'Ada Brook' }, { name: 'Tomas Reed' }, { name: 'Lena Ortiz' }, { name: 'Sam Hale' }],
});

// Status follows presence, for example when the person leaves home.
setTimeout(() => owner.setStatus('away'), 3000);

document.body.append(owner.el, people.el);
