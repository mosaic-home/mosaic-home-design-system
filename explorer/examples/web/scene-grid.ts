import { mdiCoffeeOutline, mdiMovieOpenOutline, mdiWeatherNight, mdiWeatherSunset } from '@mdi/js';
import { createSceneGrid, type Scene } from '@mosaic-home/design-system/web';

const scenes: Scene[] = [
  { id: 'morning', label: 'Morning', icon: mdiCoffeeOutline, description: 'Bright, cool white' },
  { id: 'evening', label: 'Evening', icon: mdiWeatherSunset, description: 'Dim, warm' },
  { id: 'film', label: 'Film night', icon: mdiMovieOpenOutline, description: 'Lamps low, blinds down' },
  { id: 'night', label: 'Goodnight', icon: mdiWeatherNight, description: 'Everything off' },
];

const grid = createSceneGrid({
  label: 'Scenes',
  scenes,
  active: 'evening',
  onActivate: (id) => grid.update({ active: id }),
});

document.body.append(grid.el);
