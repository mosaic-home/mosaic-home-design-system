import { createLightGroup, type LightGroupMember } from '@mosaic-home/design-system/web';

let members: LightGroupMember[] = [
  { id: 'pendants', name: 'Pendants', on: true, brightness: 80 },
  { id: 'counter', name: 'Counter strip', on: true, brightness: 40 },
  { id: 'spots', name: 'Spots', on: false, brightness: 0 },
];

// A null id changes every light in the group.
const change = (id: string | null, patch: Partial<LightGroupMember>): void => {
  members = members.map((m) => (id === null || m.id === id ? { ...m, ...patch } : m));
  group.update({ members });
};

const group = createLightGroup({
  name: 'Kitchen',
  members,
  onToggle: (on) => change(null, { on }),
  onBrightness: (brightness) => change(null, { brightness, on: brightness > 0 }),
  onMemberToggle: (id, on) => change(id, { on }),
  onMemberBrightness: (id, brightness) => change(id, { brightness, on: brightness > 0 }),
});

document.body.append(group.el);
