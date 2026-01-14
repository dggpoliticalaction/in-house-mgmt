'use client';

import { Table, Badge, Stack, Title, LoadingOverlay, Paper, Group, Text, Pagination, Center, HoverCard } from '@mantine/core';
import { useState } from 'react';

export interface Contact {
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

interface ContactTableProps {
  contacts: Contact[];
  loading?: boolean;
  onRowClick?: (contact: Contact) => void;
  showTitle?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

interface AcceptanceStats {
  contact_did: string;
  contact_name: string;
  accepted: number;
  rejected: number;
  total: number;
  acceptance_percentage: number;
}

// TODO: Implement acceptance stats fetch when backend endpoint is available
// function TagWithStats({ tag, contactDiscordId }: { tag: Tag; contactDiscordId: string }) {
//   const [stats, setStats] = useState<AcceptanceStats | null>(null);
//   const [loading, setLoading] = useState(false);
//
//   const fetchStats = async () => {
//     if (stats || loading) return;
//     setLoading(true);
//     try {
//       const response = await fetch(`/api/contacts/${contactDiscordId}/acceptance-stats/`);
//       const data = await response.json();
//       setStats(data);
//     } catch (error) {
//       console.error('Error fetching acceptance stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   return (
//     <HoverCard width={280} shadow="md">
//       <HoverCard.Target>
//         <Badge size="sm" color={tag.color} style={{ cursor: 'pointer' }} onMouseEnter={fetchStats}>
//           {tag.name}
//         </Badge>
//       </HoverCard.Target>
//       <HoverCard.Dropdown>
//         <Stack gap="xs">
//           <Text size="sm" fw={500}>{tag.name} - Acceptance Stats</Text>
//           {loading ? (
//             <Text size="xs" c="dimmed">Loading...</Text>
//           ) : stats ? (
//             <>
//               <Text size="xs" c="dimmed">Accepted: {stats.accepted} ({stats.acceptance_percentage}%)</Text>
//               <Text size="xs" c="dimmed">Rejected: {stats.rejected}</Text>
//               <Text size="xs" c="dimmed">Total: {stats.total}</Text>
//             </>
//           ) : (
//             <Text size="xs" c="dimmed">No data available</Text>
//           )}
//         </Stack>
//       </HoverCard.Dropdown>
//     </HoverCard>
//   );
// }

function TagWithStats({ tag }: { tag: Tag }) {
  return (
    <HoverCard width={200} shadow="md">
      <HoverCard.Target>
        <Badge size="sm" color={tag.color} style={{ cursor: 'pointer' }}>
          {tag.name}
        </Badge>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="xs" c="dimmed">Acceptance stats not implemented yet</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default function ContactTable({
  contacts,
  loading = false,
  onRowClick,
  showTitle = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: ContactTableProps) {
  const formatContactInfo = (email: string | null, phone: string | null) => {
    const parts = [];
    if (email) parts.push(email);
    if (phone) parts.push(phone);
    return parts.length > 0 ? parts.join(' • ') : 'No contact info';
  };

  return (
    <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
      <LoadingOverlay visible={loading} />
      <Stack gap="md">
        {showTitle && <Title order={4}>Contacts ({contacts.length})</Title>}
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
            {contacts.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  <Text c="dimmed" py="xl">No contacts found.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              contacts.map((contact) => (
                <Table.Tr
                  key={contact.discord_id}
                  onClick={() => onRowClick?.(contact)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  <Table.Td>{contact.full_name}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">{contact.discord_id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatContactInfo(contact.email, contact.phone)}</Text>
                  </Table.Td>
                  <Table.Td>
                    {contact.tags && contact.tags.length > 0 ? (
                      <Group gap="xs">
                        {contact.tags.slice(0, 3).map((tag) => (
                          <TagWithStats key={tag.id} tag={tag} />
                        ))}
                        {contact.tags.length > 3 && (
                          <Badge variant="dot" size="sm" c="dimmed">
                            +{contact.tags.length - 3}
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
