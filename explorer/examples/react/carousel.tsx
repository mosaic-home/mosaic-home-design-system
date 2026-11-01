import { Card, Carousel } from '@mosaic-home/design-system/react';

const stories = [
  { source: 'Riverside Courier', time: '2 h ago', title: 'Council approves a cycle path along the canal' },
  { source: 'Morning Ledger', time: '5 h ago', title: 'Local bakery wins a prize for its sourdough' },
  { source: 'Valley Weekly', time: 'Yesterday', title: 'Library extends its weekend opening hours' },
];

export function CarouselExample() {
  return (
    <Carousel label="News">
      {stories.map((story) => (
        <Card
          key={story.title}
          eyebrow={`${story.source} · ${story.time}`}
          title={story.title}
          titleLines={3}
          variant="flat"
          onClick={() => console.log(`Open: ${story.title}`)}
        />
      ))}
    </Carousel>
  );
}
