'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper, Text } from '@mantine/core';

export interface Event {
  id:number,
  event_status: string,
  status_display: string,
  name: string,
  description: string | null,
  location_name: string | null,
  location_address: string | null,
  location_display: string,
  starts_at: string,
  ends_at: string,
  // created_at: string,
  // modified_at: string,
}

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRowClick?: (event: Event) => void;
  showTitle?: boolean;
}

export default function EventsTable({
  events,
  loading = false,
  onRowClick,
  showTitle = true
}: EventsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        {showTitle && <Title order={4}>Events ({events.length})</Title>}
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Event Name</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Location</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {events.length === 0 ? (
              <Table.Tr>
                <Table.Td key={0} colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c="dimmed" py="xl">No events found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              events.map((event) => (
                <Table.Tr
                  key={event.id}
                  onClick={() => onRowClick?.(event)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  <Table.Td>
                    <Text size="sm" fw={500}>{event.name}</Text>
                    {event.description && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {event.description}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{event.status_display}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(event.starts_at)} - {formatDate(event.ends_at)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{event.location_display}</Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}