import { Breadcrumbs } from '@mosaic-home/design-system/react';

export function BreadcrumbsExample() {
  return (
    <Breadcrumbs
      maxItems={3}
      items={[
        { label: 'Home', icon: 'home', href: '#/' },
        { label: 'Ground floor', href: '#/floors/ground' },
        { label: 'Living room', href: '#/rooms/living-room' },
        { label: 'Ceiling light' },
      ]}
    />
  );
}
