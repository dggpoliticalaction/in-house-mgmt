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
  Box
} from '@mantine/core';
import { useState, useEffect } from 'react';
import ReachesTable, { type Reach } from '@/app/components/ReachesTable';
import VolunteerSearch from '@/app/components/VolunteerSearch';
import { statusLabels, typeLabels } from '@/app/components/Labels';

export default function CallsPage() {
  const [reaches, setReaches] = useState<Reach[]>([]);
  const [selectedReach, setSelectedReach] = useState<Reach | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('in-progress');
  const [priority, setPriority] = useState('p3');
  const [assignee, setAssignee] = useState('admin');

  const statuses = ['all', 'open', 'in-progress', 'blocked', 'completed'];

  useEffect(() => {
    fetchReaches();
  }, []);

  const fetchReaches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reaches/priority/');
      console.log('Fetch response:', response);
      const data = await response.json();
      setReaches(data);
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
      const response = await fetch(`/api/reaches/${selectedReach.rid}/`, {
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
          r.rid === updatedReach.rid ? updatedReach : r
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

  return (
    <Container size="xl" py="xl">
      <Grid>
        {/* Main Content Area */}
        <Grid.Col span={{ base: 12, md: selectedReach ? 8 : 12 }}>
          <Stack gap="md">
            {/* Header */}
            <Group justify="space-between">
              <Title order={2}>
                {selectedReach ? selectedReach.title : 'Call Queue Management'}
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
              <ReachesTable
                reaches={reaches}
                loading={loading}
                onRowClick={handleRowClick}
              />
            ) : (
              <Paper p="md" withBorder style={{ position: 'relative', minHeight: '400px' }}>
                // Show call instructions for selected reach
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
                    <Badge variant="filled" color={getStatusColor(selectedReach.status)} mt={4}>
                      {statusLabels[selectedReach.status]}
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
                    <Text size="sm" mt={4}>{typeLabels[selectedReach.type] || selectedReach.type}</Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Assigned To</Text>
                    <Text size="sm" mt={4}>{selectedReach.assigned || 'Unassigned'}</Text>
                  </Box>
                  <Divider />
                  <Box>
                    <Text size="sm" c="dimmed">Reach ID</Text>
                    <Text size="sm" mt={4}>#{selectedReach.rid}</Text>
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
              <VolunteerSearch reachId={selectedReach.rid} />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}
