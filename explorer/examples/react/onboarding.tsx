import { useState } from 'react';
import { Onboarding, Switch, Text } from '@mosaic-home/design-system/react';

export function OnboardingExample() {
  const [step, setStep] = useState(0);
  const [notify, setNotify] = useState(true);
  const [finished, setFinished] = useState(false);
  if (finished) return <Text>All set. Notifications are {notify ? 'on' : 'off'}.</Text>;
  return (
    <Onboarding
      step={step}
      onStepChange={setStep}
      onDone={() => setFinished(true)}
      onSkip={() => setFinished(true)}
      steps={[
        { title: 'Welcome home', text: 'Every room, light and sensor on one screen.', icon: 'home' },
        { title: 'Group by room', text: 'Rooms keep the dashboard short. Reorder them any time.', icon: 'lightbulb' },
        {
          title: 'Stay in the loop',
          text: 'Get a gentle chime when a door is left open.',
          icon: 'bell',
          content: <Switch label="Allow notifications" row checked={notify} onChange={(e) => setNotify(e.target.checked)} />,
        },
      ]}
    />
  );
}
