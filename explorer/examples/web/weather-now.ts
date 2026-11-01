import { createWeatherNow, weatherConditionFromText } from '@mosaic-home/design-system/web';

// A forecast source's own words, mapped to a condition for the icon and tint.
const text = 'Light rain showers';

const weather = createWeatherNow({
  condition: weatherConditionFromText(text),
  text,
  temperature: 9,
  place: 'Hillside',
  detail: 'Feels 6° · 80% rain',
});

document.body.append(weather.el);
