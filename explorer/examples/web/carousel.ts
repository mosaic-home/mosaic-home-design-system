import { createCard, createCarousel } from '@mosaic-home/design-system/web';

const stories = [
  { source: 'Riverside Courier', time: '2 h ago', title: 'Council approves a cycle path along the canal' },
  { source: 'Morning Ledger', time: '5 h ago', title: 'Local bakery wins a prize for its sourdough' },
  { source: 'Valley Weekly', time: 'Yesterday', title: 'Library extends its weekend opening hours' },
];

const carousel = createCarousel({
  label: 'News',
  items: stories.map(
    (story) =>
      createCard({
        eyebrow: `${story.source} · ${story.time}`,
        title: story.title,
        titleLines: 3,
        variant: 'flat',
        onClick: () => console.log(`Open: ${story.title}`),
      }).el,
  ),
});

document.body.append(carousel.el);
