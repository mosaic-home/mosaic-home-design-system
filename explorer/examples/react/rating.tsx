import { useState } from 'react';
import { Rating } from '@mosaic-home/design-system/react';

export function RatingExample() {
  const [stars, setStars] = useState(4);
  return <Rating label="How was the film?" value={stars} onChange={setStars} />;
}
