'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper } from '@mantine/core';
import { statusLabels, typeLabels } from './Labels';

export interface Reach {
  rid: number;
  status: number;
  assigned: string | null;
  title: string;
  description: string;
  type: string;
  priority: number;
}

interface ReachesTableProps {
  reaches: Reach[];
  loading?: boolean;
  onRowClick?: (reach: Reach) => void;
  showTitle?: boolean;
}

const getPriorityColor = (priority: number) => {
  if (priority >= 8) return 'red';
  if (priority >= 5) return 'orange';
  if (priority >= 3) return 'yellow';
  return 'blue';
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'gray';
    case 1: return 'blue';
    case 2: return 'cyan';
    case 3: return 'red';
    case 4: return 'green';
    default: return 'gray';
  }
};

export default function ReachesTable({
  reaches,
  loading = false,
  onRowClick,
  showTitle = true
}: ReachesTableProps) {
  return (
    <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        {showTitle && <Title order={4}>Available Reaches</Title>}
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reaches.map((reach) => (
              <Table.Tr
                key={reach.rid}
                onClick={() => onRowClick?.(reach)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <Table.Td>{reach.rid}</Table.Td>
                <Table.Td>{reach.title}</Table.Td>
                <Table.Td>
                  <Badge variant="light">{typeLabels[reach.type] || reach.type}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getPriorityColor(reach.priority)}>
                    {reach.priority}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(reach.status)}>
                    {statusLabels[reach.status]}
                  </Badge>
                </Table.Td>
                <Table.Td>{reach.assigned || 'Unassigned'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
