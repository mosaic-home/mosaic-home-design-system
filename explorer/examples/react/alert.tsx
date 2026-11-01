import { useState } from 'react';
import { Alert, Button } from '@mosaic-home/design-system/react';

export function AlertExample() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('No reading for 2 hours.');
  const retry = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setMessage('Still no reading. Check that the sensor has power.');
    }, 800);
  };
  return (
    <Alert
      tone="danger"
      title="Hallway sensor offline"
      dismissible
      action={
        <Button variant="secondary" size="small" loading={checking} onClick={retry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
