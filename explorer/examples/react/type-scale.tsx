import { ThemeProvider, useTokens } from '@mosaic-home/design-system/react';

function Reading() {
  // For SVG text, read the size from the type scale of the current device class.
  const { type, typeface, theme } = useTokens();
  return (
    <svg width={200} height={type.display * 1.4} role="img" aria-label="19.5 degrees">
      <text y={type.display} fontSize={type.display} fontFamily={typeface.sans} fill={theme.palette.heading}>
        19.5°
      </text>
    </svg>
  );
}

export function TypeScaleExample() {
  return (
    <ThemeProvider theme="midnight" deviceClass="tablet">
      {/* In CSS the sizes are the --mh-text-* variables. */}
      <h2 style={{ fontSize: 'var(--mh-text-headline)' }}>Kitchen</h2>
      <Reading />
    </ThemeProvider>
  );
}
