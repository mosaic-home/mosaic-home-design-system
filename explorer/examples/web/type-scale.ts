import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

// In CSS the sizes are the --mh-text-* variables, which follow the device class.
const title = document.createElement('h2');
title.textContent = 'Kitchen';
title.style.fontSize = 'var(--mh-text-headline)';

// In code, resolve the theme for a device class and read its type scale.
const tokens = resolveTokens(themeById('midnight')!, 'tablet');
const size = tokens.type.display;

const reading = document.createElement('canvas');
reading.width = 200;
reading.height = size * 1.4;
const ctx = reading.getContext('2d')!;
ctx.font = `${size}px ${tokens.typeface.sans}`;
ctx.fillStyle = tokens.theme.palette.heading;
ctx.fillText('19.5°', 0, size);

document.body.append(title, reading);
