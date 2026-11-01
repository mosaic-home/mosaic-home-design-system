import { createBreadcrumbs } from '@mosaic-home/design-system/web';

const breadcrumbs = createBreadcrumbs({
  // The last item is the current page.
  items: [
    { label: 'Home', icon: 'home', href: '#/' },
    { label: 'Ground floor', href: '#/floors/ground' },
    { label: 'Living room', href: '#/rooms/living-room' },
    { label: 'Ceiling light' },
  ],
  maxItems: 3,
});

document.body.append(breadcrumbs.el);
