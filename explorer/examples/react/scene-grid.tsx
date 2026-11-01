import { useState } from 'react';
import { mdiCoffeeOutline, mdiMovieOpenOutline, mdiWeatherNight, mdiWeatherSunset } from '@mdi/js';
import { SceneGrid } from '@mosaic-home/design-system/react';
import type { Scene } from '@mosaic-home/design-system/web';

const scenes: Scene[] = [
  { id: 'morning', label: 'Morning', icon: mdiCoffeeOutline, description: 'Bright, cool white' },
  { id: 'evening', label: 'Evening', icon: mdiWeatherSunset, description: 'Dim, warm' },
  { id: 'film', label: 'Film night', icon: mdiMovieOpenOutline, description: 'Lamps low, blinds down' },
  { id: 'night', label: 'Goodnight', icon: mdiWeatherNight, description: 'Everything off' },
];

export function SceneGridExample() {
  const [active, setActive] = useState('evening');
  return <SceneGrid label="Scenes" scenes={scenes} active={active} onActivate={setActive} />;
}
