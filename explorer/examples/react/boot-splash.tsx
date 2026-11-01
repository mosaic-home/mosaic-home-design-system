import { useEffect, useState } from 'react';
import { BootSplash } from '@mosaic-home/design-system/react';

const steps = ['Starting…', 'Connecting…', 'Loading rooms…', 'Almost ready…'];

export function BootSplashExample() {
  const [step, setStep] = useState(0);
  const [booted, setBooted] = useState(false);
  const ready = step >= steps.length - 1;

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(timer);
  }, [step, ready]);

  if (booted) return <p>Welcome home</p>;
  return (
    <BootSplash
      name="Mosaic Home"
      message={steps[step]}
      progress={step === 0 ? null : (step / (steps.length - 1)) * 100}
      leaving={ready}
      onLeft={() => setBooted(true)}
    />
  );
}
