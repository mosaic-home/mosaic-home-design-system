import { useEffect, useState } from 'react';
import { Button, ProgressBar } from '@mosaic-home/design-system/react';

export function ProgressBarExample() {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const running = started && value < 100;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setValue((v) => Math.min(100, v + 10)), 400);
    return () => clearInterval(timer);
  }, [running]);
  const start = () => {
    setValue(0);
    setStarted(true);
  };
  return (
    <>
      <ProgressBar label="Firmware update" showLabel showValue value={value} />
      <Button icon="download" disabled={running} onClick={start}>
        Update
      </Button>
    </>
  );
}
