import { useEffect, useState } from 'react';
import { ProgressList } from '@mosaic-home/design-system/react';
import type { ProgressListItem } from '@mosaic-home/design-system/web';

const jobs = (step: number): ProgressListItem[] => {
  const firmware = Math.min(100, step * 10);
  return [
    {
      name: 'Hallway sensor firmware',
      value: firmware,
      status: firmware === 100 ? 'Installed' : 'Updating',
      detail: 'Version 2.3.1',
      tone: firmware === 100 ? 'success' : 'accent',
    },
    { name: 'Weekly backup', value: Math.min(100, 40 + step * 4), status: 'Uploading', detail: 'of 3.4 GB' },
    { name: 'Garden map', value: null, status: 'Preparing' },
  ];
};

export function ProgressListExample() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= 15) return;
    const timer = setTimeout(() => setStep((s) => s + 1), 800);
    return () => clearTimeout(timer);
  }, [step]);
  return <ProgressList label="Updates and backups" items={jobs(step)} />;
}
