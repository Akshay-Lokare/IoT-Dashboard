import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 150 },
  { field: 'status', headerName: 'Status', width: 120 },
  { field: 'location', headerName: 'Location', width: 150 },
];

const rows = [
  { id: 1, name: 'Sensor A', status: 'Active', location: 'Room 101' },
  { id: 2, name: 'Sensor B', status: 'Inactive', location: 'Room 102' },
  { id: 3, name: 'Sensor C', status: 'Active', location: 'Room 103' },
];

export default function DeviceTable() {
  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}
