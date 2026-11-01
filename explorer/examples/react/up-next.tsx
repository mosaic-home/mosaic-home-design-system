import { useState } from 'react';
import { UpNext } from '@mosaic-home/design-system/react';
import type { UpNextItem } from '@mosaic-home/design-system/web';

export function UpNextExample() {
  const [items, setItems] = useState<UpNextItem[]>([
    { id: 'q1', title: 'Harbour Lights', subtitle: 'The Low Hills', art: '/art/up-next-1.jpg', duration: 214 },
    { id: 'q2', title: 'Slow Rivers', subtitle: 'Ines Okafor-Lund', art: '/art/up-next-2.jpg', duration: 187 },
    { id: 'q3', title: 'A Map of Quiet Places', subtitle: 'Cinder Vale Quartet', duration: 301 },
  ]);
  const [playing, setPlaying] = useState('Lanterns Over the Quay');
  const drop = (id: string) => setItems((list) => list.filter((i) => i.id !== id));
  const play = (id: string) => {
    setPlaying(items.find((i) => i.id === id)?.title ?? playing);
    drop(id);
  };
  return (
    <>
      <p>Now playing: {playing}</p>
      <UpNext items={items} onPlay={play} onRemove={drop} />
    </>
  );
}
