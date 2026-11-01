import { createRating } from '@mosaic-home/design-system/web';

const status = document.createElement('p');
const rating = createRating({
  label: 'How was the film?',
  value: 4,
  // Choosing the current star again clears the rating to 0.
  onChange: (value) => (status.textContent = value ? `You gave it ${value} of 5` : 'Not rated'),
});

document.body.append(rating.el, status);
