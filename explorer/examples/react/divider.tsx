import { Button, Divider, Text } from '@mosaic-home/design-system/react';

export function DividerExample() {
  return (
    <div>
      <Button icon="camera" variant="primary" fullWidth>
        Scan the QR code
      </Button>
      <Divider label="or" />
      <Text tone="muted">Enter the pairing code shown on the device.</Text>
      <Divider />
      <Button variant="text">Cancel</Button>
    </div>
  );
}
