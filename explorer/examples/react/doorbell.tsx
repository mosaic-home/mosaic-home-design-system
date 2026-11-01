import { useState } from 'react';
import { Button, Doorbell } from '@mosaic-home/design-system/react';

export function DoorbellExample() {
  const [ringing, setRinging] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [talking, setTalking] = useState(false);
  const close = () => {
    setRinging(false);
    setAnswered(false);
    setTalking(false);
  };
  return (
    <>
      {/* In an app this happens when the doorbell rings. */}
      <Button icon="bell" onClick={() => setRinging(true)}>
        Ring the doorbell
      </Button>
      {ringing && (
        <Doorbell
          door="Front door"
          visitor="Parcel delivery"
          when="Just now"
          src="/snapshots/front-door.jpg"
          takeover
          answered={answered}
          talking={talking}
          onAnswer={() => setAnswered(true)}
          onTalk={setTalking}
          onDismiss={close}
        />
      )}
    </>
  );
}
