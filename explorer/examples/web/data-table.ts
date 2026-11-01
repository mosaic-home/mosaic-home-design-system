import { createDataTable, createText, type DataTableColumn } from '@mosaic-home/design-system/web';

interface Device {
  id: string;
  name: string;
  room: string;
  battery: number;
}

const devices: Device[] = [
  { id: 'd1', name: 'Hall motion sensor', room: 'Hallway', battery: 82 },
  { id: 'd2', name: 'Front door lock', room: 'Hallway', battery: 9 },
  { id: 'd3', name: 'Kitchen window', room: 'Kitchen', battery: 67 },
  { id: 'd4', name: 'Bedroom radiator', room: 'Bedroom', battery: 23 },
];

const columns: DataTableColumn<Device>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'room', label: 'Room', sortable: true },
  { id: 'battery', label: 'Battery', align: 'end', sortable: true, render: (d) => `${d.battery}%` },
];

const status = createText('Nothing selected', { variant: 'caption', tone: 'muted' });

const table = createDataTable({
  columns,
  rows: devices,
  rowId: (d) => d.id,
  rowLabel: (d) => d.name,
  label: 'Devices',
  selectable: true,
  sort: { column: 'name', direction: 'ascending' },
  onSelectionChange: (ids) => {
    status.textContent = ids.length ? `${ids.length} selected` : 'Nothing selected';
  },
});

document.body.append(table.el, status);
