import { WeatherNow } from '@mosaic-home/design-system/react';
import { weatherConditionFromText } from '@mosaic-home/design-system/web';

// A forecast source's own words, mapped to a condition for the icon and tint.
const TEXT = 'Light rain showers';

export function WeatherNowExample() {
  return (
    <WeatherNow
      condition={weatherConditionFromText(TEXT)}
      text={TEXT}
      temperature={9}
      place="Hillside"
      detail="Feels 6° · 80% rain"
    />
  );
}
