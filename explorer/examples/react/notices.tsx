import { useState } from 'react';
import { Notice } from '@mosaic-home/design-system/react';

export function NoticesExample() {
  const [answer, setAnswer] = useState('');
  return (
    <>
      <Notice
        kind="permission"
        icon="microphone"
        title="Talk to your home"
        points={['Listens only while you hold the button', 'Turn it off any time in Settings']}
        actions={[
          { label: 'Allow microphone', primary: true, onClick: () => setAnswer('Allowed') },
          { label: 'Not now', dismisses: true, onClick: () => setAnswer('Asked again later') },
        ]}
      >
        Allow microphone access to control lights and climate by voice.
      </Notice>
      <p aria-live="polite">{answer}</p>
      <Notice kind="tip" actions={[{ label: 'Got it', primary: true, dismisses: true }]}>
        Long-press a tile to change its size or move it to another room.
      </Notice>
    </>
  );
}
