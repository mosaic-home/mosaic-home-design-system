import { applyTheme } from '@mosaic-home/design-system/web';

// Sets the --mh-* variables on <html> and returns the resolved tokens.
const tokens = applyTheme('midnight');

// In CSS, colour roles are variables that follow the theme.
const badge = document.createElement('span');
badge.textContent = 'Heating';
badge.style.background = 'var(--mh-accent-soft)';
badge.style.color = 'var(--mh-accent-light)';

// Where CSS can't reach (a canvas), read the palette.
const chart = document.createElement('canvas');
chart.width = 240;
chart.height = 80;
const ctx = chart.getContext('2d')!;
tokens.theme.palette.series.slice(0, 3).forEach((colour, i) => {
  ctx.fillStyle = colour;
  ctx.fillRect(i * 80 + 8, 80 - (i + 1) * 24, 64, (i + 1) * 24);
});

document.body.append(badge, chart);
