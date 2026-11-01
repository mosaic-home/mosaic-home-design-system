import { createFavouriteToggle, createText } from '@mosaic-home/design-system/web';

const status = createText('Not on the home screen', { variant: 'caption', tone: 'muted' });

const favourite = createFavouriteToggle({
  label: 'Favourite: Kitchen light',
  onChange: (pressed) => {
    status.textContent = pressed ? 'Pinned to the home screen' : 'Not on the home screen';
  },
});

document.body.append(favourite.el, status);
