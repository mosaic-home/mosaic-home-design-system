import { resolveTokens, themeById } from '@mosaic-home/design-system/tokens';

// Levels 1–3 are the --mh-shadow-* variables; the theme decides between a shadow, a glow or none.
const card = document.createElement('article');
card.textContent = 'Front door locked';
Object.assign(card.style, {
  padding: 'var(--mh-space-lg)',
  borderRadius: 'var(--mh-radius-lg)',
  background: 'var(--mh-surface-solid)',
  boxShadow: 'var(--mh-shadow-1)',
});

// Lift the card while it is pressed.
card.addEventListener('pointerdown', () => (card.style.boxShadow = 'var(--mh-shadow-3)'));
card.addEventListener('pointerup', () => (card.style.boxShadow = 'var(--mh-shadow-1)'));

// The raw values, for renderers that draw their own shadows (a canvas, a native view).
const { blur, offsetY, alpha } = resolveTokens(themeById('midnight')!).elevation[2];
console.info(`Level 2: ${offsetY}px down, ${blur}px blur, opacity ${alpha}`);

document.body.append(card);
