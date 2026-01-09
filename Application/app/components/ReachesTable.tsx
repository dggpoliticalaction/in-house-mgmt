'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper } from '@mantine/core';

// TODO: Rename to Ticket
export interface Reach {
  id: number;
  tiket_status: number;
  contact: string | null;
  title: string;
  description: string;
  ticket_type: string;
  priority: number;
  created_at: string;
  modified_at: string;
}

// TODO: Rename to TicketTableProbs
interface ReachesTableProps {
  reaches: Reach[];
  loading?: boolean;
  onRowClick?: (reach: Reach) => void;
  showTitle?: boolean;
}

const getPriorityColor = (priority: number) => {
  if (priority < 1) return 'red';
  if (priority < 3) return 'orange';
  if (priority == 3) return 'yellow';
  if (priority <= 5) return 'gray';
  return 'gray';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'gray';
    case 'TODO': return 'gray';
    case 'IN_PROGRESS': return 'blue';
    case 'BLOCKED': return 'red';
    case 'COMPLETED': return 'DimGray';
    case 'CANCELED': return 'red';
    default: return 'DimGray';
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
                key={reach.id}
                onClick={() => onRowClick?.(reach)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                <Table.Td>{reach.id}</Table.Td>
                <Table.Td>{reach.title}</Table.Td>
                <Table.Td>
                  <Badge variant="light">{reach.type_display}</Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getPriorityColor(reach.priority)}>
                    P{reach.priority}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(reach.ticket_status)}>
                    {reach.status_display}
                  </Badge>
                </Table.Td>
                <Table.Td>{reach.contact || 'Unassigned'}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
