'use client';

import {
  Container,
  Title,
  Grid,
  Paper,
  Group,
  Badge,
  Select,
  Stack,
  Text,
  Button,
  Timeline,
  Divider,
  Box,
  ActionIcon
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import ReachesTable, { type Reach } from '@/app/components/ReachesTable';
import VolunteerSearch from '@/app/components/VolunteerSearch';

// TODO: /tickets/123 doesn't work, we should make sure the url reflects the current ticket
// TODO: Rename reaches/calls to use Ticket as name
export default function TicketPage() {
  const [reaches, setReaches] = useState<Reach[]>([]);
  const [selectedReach, setSelectedReach] = useState<Reach | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('in-progress');
  const [priority, setPriority] = useState('p3');
  const [assignee, setAssignee] = useState('admin');
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [previousUrl, setPreviousUrl] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const statuses = ['all', 'open', 'in-progress', 'blocked', 'completed'];

  useEffect(() => {
    fetchReaches();
  }, []);

  const fetchReaches = async (url?: string) => {
    try {
      setLoading(true);
      const fetchUrl = url || '/api/tickets/';
      const response = await fetch(fetchUrl);
      console.log('Fetch response:', response);
      const data = await response.json();
      console.log('Fetched reaches data:', data);
      setReaches(data.results);
      setTotalCount(data.count);
      setNextUrl(data.next);
      setPreviousUrl(data.previous);
    } catch (error) {
      console.error('Error fetching reaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (reach: Reach) => {
    setSelectedReach(reach);
  };

  const handleBackToTable = () => {
    setSelectedReach(null);
  };

  const handleUpdateStatus = async (newStatus: number, statusName: string) => {
    if (!selectedReach) return;

    try {
      const response = await fetch(`/api/tickets/${selectedReach.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        const updatedReach = await response.json();

        // Update the selected reach
        setSelectedReach(updatedReach);

        // Update the reach in the reaches list
        setReaches(reaches.map(r =>
          r.id === updatedReach.id ? updatedReach : r
        ));
      } else {
        const error = await response.json();
        alert(`Error updating status: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error updating reach status:', error);
      alert(`Failed to update status to ${statusName}`);
    }
  };

  // TODO: Use code in ReachesTable.tsx
  const getPriorityColor = (priority: number) => {
    if (priority < 1) return 'red';
    if (priority < 3) return 'orange';
    if (priority == 3) return 'yellow';
    if (priority <= 5) return 'gray';
    return 'gray';
  };

  // TODO: Use code in ReachesTable.tsx
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

  return (
    <Container size="xl" py="xl">
      <Grid>
        {/* Main Content Area */}
        <Grid.Col span={{ base: 12, md: selectedReach ? 8 : 12 }}>
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between">
              <Title order={2}>
                {selectedReach ? selectedReach.title : 'Ticket Queue Management'}
              </Title>
              {selectedReach && (
                <Button variant="outline" onClick={handleBackToTable}>
                  Back to List
                </Button>
              )}
            </Group>

            {/* Status Filters */}
            {!selectedReach && (
              <Paper p="md" withBorder>
                <Stack gap="md">
                  <Group gap="xs">
                    {statuses.map((s) => (
                      <Badge
                        key={s}
                        variant={status === s ? 'filled' : 'light'}
                        style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                        onClick={() => setStatus(s)}
                      >
                        {s.replace('-', ' ')}
                      </Badge>
                    ))}
                  </Group>

                  <Group gap="md">
                    <Select
                      label="Priority"
                      value={priority}
                      onChange={(value) => setPriority(value || 'p3')}
                      data={[
                        { value: 'p1', label: 'P1 - Critical' },
                        { value: 'p2', label: 'P2 - High' },
                        { value: 'p3', label: 'P3 - Normal' },
                        { value: 'p4', label: 'P4 - Low' },
                      ]}
                      style={{ flex: 1 }}
                    />
                    <Select
                      label="Assignee"
                      value={assignee}
                      onChange={(value) => setAssignee(value || 'admin')}
                      data={[
                        { value: 'admin', label: 'admin (admin@test.com)' },
                        { value: 'user1', label: 'User 1 (user1@test.com)' },
                        { value: 'user2', label: 'User 2 (user2@test.com)' },
                      ]}
                      style={{ flex: 1 }}
                    />
                    <Button mt="xl">Update</Button>
                  </Group>
                </Stack>
              </Paper>
            )}

            {/* Reaches Table or Call Instructions */}
            {!selectedReach ? (
              <>
                <ReachesTable
                  reaches={reaches}
                  loading={loading}
                  onRowClick={handleRowClick}
                />

                {/* Pagination and count */}
                <Paper p="sm" withBorder>
                  <Group justify="space-between">
                    <span>{totalCount} {totalCount === 1 ? 'ticket' : 'tickets'} found</span>
                    <Group gap="xs">
                      <ActionIcon
                        variant="filled"
                        disabled={!previousUrl}
                        onClick={() => previousUrl && fetchReaches(previousUrl)}
                        aria-label="Previous page"
                      >
                        <IconChevronLeft size={18} />
                      </ActionIcon>
                      <ActionIcon
                        variant="filled"
                        disabled={!nextUrl}
                        onClick={() => nextUrl && fetchReaches(nextUrl)}
                        aria-label="Next page"
                      >
                        <IconChevronRight size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              </>
            ) : (
              <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
                {/* Show call instructions for selected reach */}
                <Stack gap="md">
                  <Title order={4}>Call Instructions</Title>

                  <Box>
                    <Text size="sm" c="dimmed" mb="xs">Description</Text>
                    <Paper p="md" bg="gray.0" style={{ borderRadius: '4px' }}>
                      <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                        {selectedReach.description}
                      </Text>
                    </Paper>
                  </Box>

                  <ol style={{ paddingLeft: '1.5rem' }}>
                    <li>Review the reach details and requirements</li>
                    <li>Contact the assigned person or team</li>
                    <li>Discuss the reach objectives and timeline</li>
                    <li>Update the reach status based on the outcome</li>
                    <li>Mark follow-up actions if needed</li>
                  </ol>


                </Stack>
              </Paper>
            )}

            {/* Activity Section - Only show when reach is selected */}
            {selectedReach && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Activity (Dummy)</Title>
                <Timeline active={2} bulletSize={24} lineWidth={2}>
                  <Timeline.Item title="Reach updated">
                    <Text c="dimmed" size="sm">admin (admin@test.com)</Text>
                    <Text size="xs" mt={4}>Dec 31, 16:29</Text>
                  </Timeline.Item>
                  <Timeline.Item title="Status updated to In Progress">
                    <Text c="dimmed" size="sm">admin (admin@test.com)</Text>
                    <Text size="xs" mt={4}>Dec 31, 16:27</Text>
                  </Timeline.Item>
                  <Timeline.Item title="Reach assigned">
                    <Text c="dimmed" size="sm">System</Text>
                    <Text size="xs" mt={4}>Dec 31, 16:05</Text>
                  </Timeline.Item>
                </Timeline>
              </Paper>
            )}
          </Stack>
        </Grid.Col>

        {/* Sidebar - Only show when reach is selected */}
        {selectedReach && (
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              {/* Status Info */}
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Box>
                    <Text size="sm" c="dimmed">Status</Text>
                    <Badge variant="filled" color={getStatusColor(selectedReach.ticket_status)} mt={4}>
                      {selectedReach.status_display}
                    </Badge>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Priority</Text>
                    <Badge variant="light" color={getPriorityColor(selectedReach.priority)} mt={4}>
                      P{selectedReach.priority}
                    </Badge>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Type</Text>
                    <Text size="sm" mt={4}>{selectedReach.type_display}</Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Assigned To</Text>
                    <Text size="sm" mt={4}>{selectedReach.contact || 'Unassigned'}</Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Reach ID</Text>
                    <Text size="sm" mt={4}>#{selectedReach.id}</Text>
                  </Box>
                </Stack>
              </Paper>

              {/* Actions */}
              <Paper p="md" withBorder>
                <Title order={5} mb="md">Actions</Title>
                <Stack gap="xs">
                  <Button
                    fullWidth
                    variant="filled"
                    color="red"
                    onClick={() => handleUpdateStatus(3, 'Blocked')}
                  >
                    Mark as Blocked
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    color="gray"
                    onClick={() => handleUpdateStatus(4, 'Completed')}
                  >
                    Close Reach
                  </Button>
                </Stack>
              </Paper>

              {/* Volunteer Search and Responses */}
              <VolunteerSearch reachId={selectedReach.id} />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}
