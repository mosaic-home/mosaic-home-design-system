import { Card, Screen, Stack, Text } from '@mosaic-home/design-system/react';

export function ScreenExample() {
  const header = (
    <Stack gap="xxs">
      <Text variant="eyebrow" tone="muted">
        Living room
      </Text>
      <Text variant="headline">Good evening</Text>
    </Stack>
  );
  return (
    <Screen width="medium" label="Home" header={header}>
      <Card title="Climate">
        <Text tone="muted">21.5° and 46% humidity.</Text>
      </Card>
      <Card title="Lights">
        <Text tone="muted">Kitchen light and 2 others are on.</Text>
      </Card>
    </Screen>
  );
}
