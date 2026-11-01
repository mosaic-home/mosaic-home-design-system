import { applyTheme } from '@mosaic-home/design-system/web';

const tokens = applyTheme('daylight', { deviceClass: 'phone', character: { density: 'compact' } });

// Prefer the variables: they follow the theme's corners and density.
const tile = document.createElement('div');
tile.textContent = 'Bedroom';
Object.assign(tile.style, {
  padding: 'var(--mh-space-md)',
  borderRadius: 'var(--mh-radius-lg)',
  minHeight: 'var(--mh-control-lg)',
  background: 'var(--mh-surface-raised)',
});

// The numbers are there for layout done in code.
const gap = tokens.space.sm;
const columns = Math.max(1, Math.floor((window.innerWidth + gap) / (160 + gap)));
const grid = document.createElement('div');
Object.assign(grid.style, {
  display: 'grid',
  gap: `${gap}px`,
  gridTemplateColumns: `repeat(${columns}, 1fr)`,
});
grid.append(tile);

document.body.append(grid);
