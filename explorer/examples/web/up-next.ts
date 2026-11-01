import { createUpNext, type UpNextEvents, type UpNextItem } from '@mosaic-home/design-system/web';

let items: UpNextItem[] = [
  { id: 'q1', title: 'Harbour Lights', subtitle: 'The Low Hills', art: '/art/up-next-1.jpg', duration: 214 },
  { id: 'q2', title: 'Slow Rivers', subtitle: 'Ines Okafor-Lund', art: '/art/up-next-2.jpg', duration: 187 },
  { id: 'q3', title: 'A Map of Quiet Places', subtitle: 'Cinder Vale Quartet', duration: 301 },
];

const drop = (id: string): void => {
  items = items.filter((i) => i.id !== id);
  queue.update({ items, ...events });
};

const events: UpNextEvents = {
  onPlay: (id) => {
    void fetch('/player/play', { method: 'POST', body: id });
    drop(id);
  },
  onRemove: drop,
};

const queue = createUpNext({ items, ...events });

document.body.append(queue.el);
