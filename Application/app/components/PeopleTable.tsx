'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper, Group, Text, Pagination, Center, HoverCard } from '@mantine/core';
import { useState } from 'react';

export interface Person {
  discord_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  tags?: Tag[];
}

export interface Group {
  gid: number;
  name: string;
  access_level?: number;
}

export interface Tag {
  tid: number;
  name: string;
}

interface PeopleTableProps {
  people: Person[];
  loading?: boolean;
  onRowClick?: (person: Person) => void;
  showTitle?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

interface AcceptanceStats {
  person_did: string;
  person_name: string;
  accepted: number;
  rejected: number;
  total: number;
  acceptance_percentage: number;
}

function TagWithStats({ tag, personDid }: { tag: Tag; personDid: string }) {
  const [stats, setStats] = useState<AcceptanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);

  // const fetchStats = async () => {
  //   if (stats) return; // Already fetched
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`/api/people/${personDid}/acceptance-stats/`);
  //     const data = await response.json();
  //     setStats(data);
  //   } catch (error) {
  //     console.error('Error fetching acceptance stats:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <HoverCard
      width={280}
      shadow="md"
      opened={opened}
      onOpen={() => {
        setOpened(true);
        // fetchStats();
      }}
      onClose={() => setOpened(false)}
    >
      <HoverCard.Target>
        <Badge variant="dot" size="sm" style={{ cursor: 'pointer' }}>
          {tag.name}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="xs">
          <Text size="sm" fw={500}>{tag.name} - Acceptance Stats</Text>
          {loading ? (
            <Text size="xs" c="dimmed">Loading...</Text>
          ) : stats ? (
            <>
              <Text size="xs" c="dimmed">
                Accepted: {stats.accepted} ({stats.acceptance_percentage}%)
              </Text>
              <Text size="xs" c="dimmed">
                Rejected: {stats.rejected}
              </Text>
              <Text size="xs" c="dimmed">
                Total: {stats.total}
              </Text>
            </>
          ) : (
            <Text size="xs" c="dimmed">No data available</Text>
          )}
        </Stack>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default function PeopleTable({
  people,
  loading = false,
  onRowClick,
  showTitle = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: PeopleTableProps) {
  const formatContact = (email: string | null, phone: string | null) => {
    const parts = [];
    if (email) parts.push(email);
    if (phone) parts.push(phone);
    return parts.length > 0 ? parts.join(' • ') : 'No contact info';
  };

  return (
    <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        {showTitle && <Title order={4}>People ({people.length})</Title>}
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Discord ID</Table.Th>
              <Table.Th>Contact</Table.Th>
              <Table.Th>Tags</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {people.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c="dimmed" py="xl">No people found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              people.map((person) => (
                <Table.Tr
                  key={person.discord_id}
                  onClick={() => onRowClick?.(person)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  <Table.Td>{person.full_name}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{person.discord_id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatContact(person.email, person.phone)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {person.tags && person.tags.length > 0 ? (
                      <Group gap="xs">
                        {person.tags.slice(0, 3).map((tag) => (
                          <TagWithStats key={tag.tid} tag={tag} personDid={person.discord_id} />
                        ))}
                        {person.tags.length > 3 && (
                          <Badge variant="dot" size="sm" c="dimmed">
                            +{person.tags.length - 3}
                          </Badge>
                        )}
                      </Group>
                    ) : (
                      <Text size="sm" c="dimmed">No tags</Text>
                    )}
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
