'use client';

import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  TextInput,
  Select,
  Stack,
  Modal,
  Textarea,
  Text
} from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import EventsTable, { type Event, type Group as EventGroup } from '@/app/components/EventsTable';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>('all');
  const [dateFilter, setDateFilter] = useState<string | null>('all');
  const [groups, setGroups] = useState<EventGroup[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 20;

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      date: '',
      location: '',
      group: ''
    },
    validate: {
      name: (value) => (!value ? 'Event name is required' : null),
      date: (value) => (!value ? 'Date is required' : null),
      group: (value) => (!value ? 'Group is required' : null)
    }
  });

  // Fetch groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch events whenever filters or page changes
  useEffect(() => {
    fetchEvents();
  }, [searchQuery, selectedGroup, dateFilter, currentPage]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups/');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString()
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroup && selectedGroup !== 'all') params.append('group', selectedGroup);
      if (dateFilter && dateFilter !== 'all') params.append('date_filter', dateFilter);

      const response = await fetch(`/api/events/with-participants/?${params}`);
      const data = await response.json();

      setEvents(data.results);
      setTotalCount(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedGroup('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  const handleRowClick = (event: Event) => {
    setSelectedEvent(event);
    setDetailsModalOpen(true);
  };

  const handleAddEvent = () => {
    form.reset();
    setAddModalOpen(true);
  };

  const handleSubmitEvent = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      setAddModalOpen(false);
      form.reset();
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prepare dropdown options
  const groupOptions = [
    { value: 'all', label: 'Any' },
    ...groups.map(g => ({ value: g.gid.toString(), label: g.name }))
  ];

  const dateFilterOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'past', label: 'Past' }
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        {/* Header with title and action buttons */}
        <Group justify="space-between">
          <Title order={2}>Events</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddEvent}
          >
            Add event
          </Button>
        </Group>

        {/* Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group gap="md" align="flex-end">
              <TextInput
                label="Search"
                placeholder="Search by name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
              />
              <Select
                label="Group"
                placeholder="Select group"
                value={selectedGroup}
                onChange={setSelectedGroup}
                data={groupOptions}
                style={{ minWidth: 200 }}
              />
              <Select
                label="Date"
                placeholder="Filter by date"
                value={dateFilter}
                onChange={setDateFilter}
                data={dateFilterOptions}
                style={{ minWidth: 200 }}
              />
            </Group>
            <Group gap="sm">
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </Group>
          </Stack>
        </Paper>

        {/* Events Table */}
        <EventsTable
          events={events}
          loading={loading}
          onRowClick={handleRowClick}
          showTitle={false}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Total count */}
        <Paper p="sm" withBorder>
          <Group justify="space-between">
            <span>{totalCount} {totalCount === 1 ? 'event' : 'events'} found</span>
          </Group>
        </Paper>
      </Stack>

      {/* Add Event Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Event"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmitEvent)}>
          <Stack gap="md">
            <TextInput
              label="Event Name"
              placeholder="Enter event name"
              required
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Description"
              placeholder="Enter event description (optional)"
              {...form.getInputProps('description')}
            />
            <TextInput
              label="Date"
              placeholder="YYYY-MM-DD or ISO date string"
              required
              {...form.getInputProps('date')}
            />
            <TextInput
              label="Location"
              placeholder="Enter location (optional)"
              {...form.getInputProps('location')}
            />
            <Select
              label="Group"
              placeholder="Select organizing group"
              required
              data={groups.map(g => ({ value: g.gid.toString(), label: g.name }))}
              {...form.getInputProps('group')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Event
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Event Details Modal */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedEvent?.name || 'Event Details'}
        size="lg"
      >
        {selectedEvent && (
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} c="dimmed">Description</Text>
              <Text size="sm">{selectedEvent.description || 'No description'}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} c="dimmed">Date</Text>
              <Text size="sm">{selectedEvent.date || 'No date specified'}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} c="dimmed">Location</Text>
              <Text size="sm">{selectedEvent.location || 'No location specified'}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} c="dimmed">Organizing Group</Text>
              <Text size="sm">{selectedEvent.group_name}</Text>
            </div>
            <div>
              <Text size="sm" fw={500} c="dimmed">Participants ({selectedEvent.participant_count})</Text>
              {selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                <Stack gap="xs" mt="xs">
                  {selectedEvent.participants.map((participant) => (
                    <Paper key={participant.did} p="xs" withBorder>
                      <Text size="sm" fw={500}>{participant.name}</Text>
                      <Text size="xs" c="dimmed">{participant.email || participant.phone || 'No contact info'}</Text>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">No participants yet</Text>
              )}
            </div>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
