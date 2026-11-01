import { Text } from '@mosaic-home/design-system/react';

export function TextExample() {
  return (
    <header>
      <Text variant="eyebrow" tone="muted">
        Living room
      </Text>
      <Text variant="display">21.5°</Text>
      <Text>Heating to 22° until 23:00.</Text>
      <Text variant="label" tone="warning">
        Window open
      </Text>
    </header>
  );
}
