import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

function EnergyBars() {
  // Where CSS can't reach (SVG fills here), read the palette of the nearest ThemeProvider.
  const { series } = useTokens().theme.palette;
  const usage = [24, 48, 36];
  return (
    <svg width={240} height={80} role="img" aria-label="Energy use by room">
      {usage.map((value, i) => (
        <rect key={i} x={i * 80 + 8} y={80 - value} width={64} height={value} fill={series[i]} />
      ))}
    </svg>
  );
}

export function PaletteExample() {
  return (
    <ThemeProvider theme="midnight">
      {/* In CSS, colour roles are --mh-* variables that follow the theme. */}
      <span style={{ background: 'var(--mh-accent-soft)', color: 'var(--mh-accent-light)' }}>Heating</span>
      <EnergyBars />
    </ThemeProvider>
  );
}
