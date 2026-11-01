import { useState } from 'react';
import { AppShell, Card, IconButton, StatusBar } from '@mosaic-home/design-system/react';

const SECTIONS = [
  { label: 'Home', icon: 'home' },
  { label: 'Lights', icon: 'lightbulb' },
  { label: 'Climate', icon: 'thermometer' },
];

export function AppShellExample() {
  const [section, setSection] = useState('Home');
  const nav = (
    <nav aria-label="Sections">
      {SECTIONS.map(({ label, icon }) => (
        <IconButton key={label} icon={icon} label={label} pressed={label === section} onClick={() => setSection(label)} />
      ))}
    </nav>
  );
  return (
    <AppShell
      title={section}
      subtitle="Living room"
      actions={<IconButton icon="search" label="Search" />}
      nav={nav}
      navPosition="auto"
      status={<StatusBar items={[{ id: 'net', label: 'Connected', icon: 'wifi', tone: 'success' }]} />}
    >
      <Card title="Climate">21.5° and 46% humidity.</Card>
      <Card title="Lights">Kitchen light and 2 others are on.</Card>
    </AppShell>
  );
}
