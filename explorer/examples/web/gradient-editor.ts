import { createGradientEditor } from '@mosaic-home/design-system/web';

const preview = document.createElement('div');
preview.style.cssText = 'height: 96px; border-radius: var(--mh-radius-lg)';

const sunrise = createGradientEditor({
  label: 'Sunrise light',
  showAngle: true,
  angle: 90,
  stops: [
    { offset: 0, color: '#1a1446' },
    { offset: 40, color: '#c2457a' },
    { offset: 100, color: '#ffb35c' },
  ],
  onInput: () => (preview.style.background = sunrise.css()),
});
preview.style.background = sunrise.css();

document.body.append(preview, sunrise.el);
