'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper, Group, Text, Pagination, Center, HoverCard } from '@mantine/core';
import { formatContact } from '../utils/helpers';

export interface Person {
  id: number;
  discord_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  tags?: Tag[];
}

export interface Group {
  id: number;
  name: string;
  access_level?: number;
}

export interface Tag {
  id: number;
  name: string;
  color: string
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

function TagWithStats({ tag }: { tag: Tag }) {

  return (
    <HoverCard width={280} shadow="md">
      <HoverCard.Target>
        <Badge size="sm" color={tag.color} style={{ cursor: 'pointer' }}>
          {tag.name}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Stack gap="xs">
          <Text size="sm" fw={500}>{tag.name} - Acceptance Stats</Text>
          <Text size="xs" c="dimmed">No data available</Text>
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
                          <TagWithStats key={tag.id} tag={tag} />
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
