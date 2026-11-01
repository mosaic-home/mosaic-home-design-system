import { createProgressList, type ProgressListItem } from '@mosaic-home/design-system/web';

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

const list = createProgressList({ label: 'Updates and backups', items: jobs(0) });

let step = 0;
const timer = setInterval(() => {
  step += 1;
  list.setItems(jobs(step));
  if (step === 15) clearInterval(timer);
}, 800);

document.body.append(list.el);
