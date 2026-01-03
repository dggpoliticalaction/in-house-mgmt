'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper, Group, Text, Pagination, Center } from '@mantine/core';

export interface Participant {
  did: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface Event {
  eid: number;
  name: string;
  description: string | null;
  date: string | null;
  location: string | null;
  group: number;
  group_name: string;
  participants: Participant[];
  participant_count: number;
}

export interface Group {
  gid: number;
  name: string;
}

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
  onRowClick?: (event: Event) => void;
  showTitle?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function EventsTable({
  events,
  loading = false,
  onRowClick,
  showTitle = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
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
              <Table.Th>Date</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Group</Table.Th>
              <Table.Th>Participants</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {events.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c="dimmed" py="xl">No events found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              events.map((event) => (
                <Table.Tr
                  key={event.eid}
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
                    <Text size="sm">{formatDate(event.date)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{event.location || 'No location'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {event.group_name}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="filled" size="sm">
                      {event.participant_count} {event.participant_count === 1 ? 'participant' : 'participants'}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        {totalPages > 1 && onPageChange && (
          <Center mt="md">
            <Pagination
              value={currentPage}
              onChange={onPageChange}
              total={totalPages}
            />
          </Center>
        )}
      </Stack>
    </Paper>
  );
}
