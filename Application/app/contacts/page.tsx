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
  MultiSelect
} from '@mantine/core';
import { IconPlus, IconFileUpload, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import PeopleTable, { type Person, type Group as PersonGroup, type Tag } from '@/app/components/PeopleTable';
import './page.css';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>('all');
  const [groups, setGroups] = useState<PersonGroup[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const itemsPerPage = 20;

  const form = useForm({
    initialValues: {
      did: '',
      name: '',
      email: '',
      phone: '',
      tags: []
    },
    validate: {
      did: (value) => (!value ? 'Discord ID is required' : null),
      name: (value) => (!value ? 'Name is required' : null),
      email: (value) => (value && !/^\S+@\S+$/.test(value) ? 'Invalid email' : null)
    }
  });



  // Fetch groups and tags on component mount
  useEffect(() => {
    fetchGroupsAndTags();
  }, []);

  // Fetch people whenever filters or page changes
  useEffect(() => {
    fetchPeople();
  }, [searchQuery, selectedGroup, selectedTag, currentPage]);

  const fetchGroupsAndTags = async () => {
    try {
      const [groupsRes, tagsRes] = await Promise.all([
        fetch('/api/groups/'),
        fetch('/api/tags/')
      ]);

      console.log('Groups response:', groupsRes);
      console.log('Tags response:', tagsRes);

      const groupsData = await groupsRes.json();
      const tagsData = await tagsRes.json();

      setGroups(groupsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching groups and tags:', error);
    }
  };

  const fetchPeople = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString()
      });

      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroup && selectedGroup !== 'all') params.append('group', selectedGroup);
      if (selectedTag && selectedTag !== 'all') params.append('tag', selectedTag);

      const response = await fetch(`/api/people/with-relations/?${params}`);
      const data = await response.json();

      setPeople(data.results);
      setTotalCount(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedGroup('all');
    setSelectedTag('all');
    setCurrentPage(1);
  };

  const handleRowClick = (person: Person) => {
    // TODO: Navigate to person detail page or show modal
    console.log('Clicked person:', person);
  };

  const handleAddPerson = () => {
    form.reset();
    setSelectedTags([]);
    setAddModalOpen(true);
  };

  const handleSubmitPerson = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      // Include selectedTags in the submission
      const personData = {
        ...values,
        tags: selectedTags
      };

      const response = await fetch('/api/people/person-and-tags/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData),
      });


      if (!response.ok) {
        throw new Error('Failed to create person');
      }

      setAddModalOpen(false);
      form.reset();
      setSelectedTags([]);
      fetchPeople();
    } catch (error) {
      console.error('Error creating person:', error);
      alert('Failed to create person. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadCSV = () => {
    // TODO: Open CSV upload modal
    console.log('Upload CSV clicked');
  };

  // Prepare dropdown options
  const groupOptions = [
    { value: 'all', label: 'Any' },
    ...groups.map(g => ({ value: g.gid.toString(), label: g.name }))
  ];

  const tagOptions = [
    { value: 'all', label: 'Any' },
    ...tags.map(t => ({ value: t.tid.toString(), label: t.name }))
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="md">
        {/* Header with title and action buttons */}
        <Group justify="space-between">
          <Title order={2}>People</Title>
          <Group gap="sm">
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAddPerson}
            >
              Add person
            </Button>
      {/*      <Button
              variant="outline"
              leftSection={<IconFileUpload size={16} />}
              onClick={handleUploadCSV}
            >
              Upload CSV
            </Button> */}
          </Group>
        </Group>

        {/* Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group gap="md" align="flex-end">
              <TextInput
                label="Search"
                placeholder="Search by name, Discord ID, email, or phone..."
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
                label="Tag"
                placeholder="Select tag"
                value={selectedTag}
                onChange={setSelectedTag}
                data={tagOptions}
                style={{ minWidth: 200 }}
              />
            </Group>
            <Group gap="sm">
              <Button variant="outline" onClick={handleReset}>Reset</Button>
            </Group>
          </Stack>
        </Paper>

        {/* People Table */}
        <PeopleTable
          people={people}
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
            <span>{totalCount} {totalCount === 1 ? 'person' : 'people'} found</span>
          </Group>
        </Paper>
      </Stack>

      {/* Add Person Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Person"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmitPerson)}>
          <Stack gap="md">
            <TextInput
              label="Discord ID"
              placeholder="Enter Discord ID"
              required
              {...form.getInputProps('did')}
            />
            <TextInput
              label="Name"
              placeholder="Enter name"
              required
              {...form.getInputProps('name')}
            />
            <TextInput
              label="Email"
              placeholder="Enter email (optional)"
              type="email"
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Phone"
              placeholder="Enter phone number (optional)"
              {...form.getInputProps('phone')}
            />

            <MultiSelect
              label="Tags"
              placeholder="Select tags"
              value={selectedTags}
              onChange={(value) => setSelectedTags(value || [])}
              data={tags.map(t => ({ value: t.name, label: t.name }))}
              searchable
              clearable
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Person
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
