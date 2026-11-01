import { mdiDoor, mdiFloorLamp } from '@mdi/js';
import { createFloorPlan, type FloorPlanMarker, type FloorPlanRoom } from '@mosaic-home/design-system/web';

// Shapes are in centimetres; the plan scales them to fit.
const rooms: FloorPlanRoom[] = [
  { id: 'living', name: 'Living room', shape: { x: 0, y: 0, width: 500, height: 400 }, light: 70 },
  { id: 'kitchen', name: 'Kitchen', shape: { x: 500, y: 0, width: 300, height: 250 }, summary: '22 °C' },
  { id: 'hall', name: 'Hall', shape: { x: 500, y: 250, width: 300, height: 150 } },
  { id: 'bedroom', name: 'Bedroom', shape: { x: 0, y: 400, width: 450, height: 300 }, climate: 'heat' },
  { id: 'bath', name: 'Bathroom', shape: { x: 450, y: 400, width: 350, height: 300 }, alert: true },
];

let markers: FloorPlanMarker[] = [
  { id: 'lamp', x: 90, y: 90, icon: mdiFloorLamp, label: 'Floor lamp', state: 'On', active: true, tone: 'warm' },
  { id: 'door', x: 790, y: 325, icon: mdiDoor, label: 'Front door', state: 'Locked' },
];

const plan = createFloorPlan({
  label: 'Ground floor',
  rooms,
  markers,
  onRoom: (id) => plan.update({ selected: id }),
  onMarker: (id) => {
    if (id !== 'lamp') return;
    markers = markers.map((m) => (m.id === id ? { ...m, active: !m.active, state: m.active ? 'Off' : 'On' } : m));
    plan.update({ markers });
  },
});

document.body.append(plan.el);
