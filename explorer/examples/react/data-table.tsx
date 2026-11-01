import { useState } from 'react';
import { DataTable, type DataTableColumnProps } from '@mosaic-home/design-system/react';
import type { DataTableSort } from '@mosaic-home/design-system/web';

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

const columns: DataTableColumnProps<Device>[] = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'room', label: 'Room', sortable: true },
  { id: 'battery', label: 'Battery', align: 'end', sortable: true, render: (d) => `${d.battery}%` },
];

export function DataTableExample() {
  const [sort, setSort] = useState<DataTableSort>({ column: 'name', direction: 'ascending' });
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <DataTable
      columns={columns}
      rows={devices}
      rowId={(d) => d.id}
      rowLabel={(d) => d.name}
      label="Devices"
      sort={sort}
      onSortChange={setSort}
      selectable
      selected={selected}
      onSelectionChange={setSelected}
    />
  );
}
