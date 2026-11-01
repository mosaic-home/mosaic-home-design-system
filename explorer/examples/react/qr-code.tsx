import { useState } from 'react';
import { QrCode, TextField } from '@mosaic-home/design-system/react';

export function QrCodeExample() {
  const [link, setLink] = useState('https://homeassistant.local:8123/');
  return (
    <>
      <TextField label="Link" value={link} onChange={(event) => setLink(event.target.value)} />
      <QrCode value={link} label="Link to the dashboard" caption="Open on your phone" />
    </>
  );
}
