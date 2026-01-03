'use client';

import {
  Container,
  Title,
  Stack,
  Paper,
  Group,
  Button,
  Modal,
  TextInput,
  Select,
  Text,
  Divider,
  Collapse,
  ActionIcon
} from '@mantine/core';
import { IconPlus, IconBuilding, IconUserCog, IconSettings, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useForm } from '@mantine/form';
import OrganizationsTable, { type Organization } from '@/app/components/OrganizationsTable';
import OrganizationMembersTable, { type GroupMember } from '@/app/components/OrganizationMembersTable';
import RolesTable, { type PersonWithRole } from '@/app/components/RolesTable';
import PlaceholderSection from '@/app/components/PlaceholderSection';
import { useAdminHandlers } from './handlers';

interface Person {
  did: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export default function ManagementConsole() {
  // Data states
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [people, setPeople] = useState<PersonWithRole[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedOrgMembers, setSelectedOrgMembers] = useState<GroupMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonWithRole | null>(null);

  // Modal states
  const [orgDetailsOpen, setOrgDetailsOpen] = useState(false);
  const [addOrgOpen, setAddOrgOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMemberOpen, setEditMemberOpen] = useState(false);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [assignRoleOpen, setAssignRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [orgDetailsLoading, setOrgDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Collapse states for sections
  const [orgSectionOpen, setOrgSectionOpen] = useState(false);
  const [roleSectionOpen, setRoleSectionOpen] = useState(false);
  const [configSectionOpen, setConfigSectionOpen] = useState(false);

  // Pagination states
  const [orgCurrentPage, setOrgCurrentPage] = useState(1);
  const [orgTotalPages, setOrgTotalPages] = useState(1);
  const [roleCurrentPage, setRoleCurrentPage] = useState(1);
  const [roleTotalPages, setRoleTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Forms
  const addOrgForm = useForm({
    initialValues: { name: '' },
    validate: { name: (value) => (!value ? 'Name is required' : null) }
  });

  const addMemberForm = useForm({
    initialValues: { person: '', access_level: '1' },
    validate: {
      person: (value) => (!value ? 'Person is required' : null),
      access_level: (value) => (!value ? 'Access level is required' : null)
    }
  });

  const editMemberForm = useForm({
    initialValues: { access_level: '1' },
    validate: { access_level: (value) => (!value ? 'Access level is required' : null) }
  });

  const assignRoleForm = useForm({
    initialValues: { person: '', access_level: '1' },
    validate: {
      person: (value) => (!value ? 'Person is required' : null),
      access_level: (value) => (!value ? 'Access level is required' : null)
    }
  });

  const editRoleForm = useForm({
    initialValues: { access_level: '1' },
    validate: { access_level: (value) => (!value ? 'Access level is required' : null) }
  });

  // Fetch data on mount and when pagination changes
  useEffect(() => {
    fetchOrganizations();
  }, [orgCurrentPage]);

  useEffect(() => {
    fetchPeopleWithRoles();
  }, [roleCurrentPage]);

  useEffect(() => {
    fetchAllPeople();
  }, []);

  // Fetch organization members when details modal opens
  useEffect(() => {
    if (orgDetailsOpen && selectedOrg) {
      fetchOrgMembers(selectedOrg.gid);
    }
  }, [orgDetailsOpen, selectedOrg]);

  // ===== Data Fetching Functions =====

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: orgCurrentPage.toString(),
        page_size: itemsPerPage.toString()
      });

      const response = await fetch(`/api/groups/with-counts/?${params}`);
      const data = await response.json();

      // Handle both paginated and non-paginated responses
      if (data.results) {
        setOrganizations(data.results);
        setOrgTotalPages(data.total_pages || 1);
      } else {
        setOrganizations(data);
        setOrgTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      alert('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgMembers = async (gid: number) => {
    setOrgDetailsLoading(true);
    try {
      const response = await fetch(`/api/groups/${gid}/members/`);
      const data = await response.json();
      setSelectedOrgMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Failed to fetch organization members');
    } finally {
      setOrgDetailsLoading(false);
    }
  };

  const fetchPeopleWithRoles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: roleCurrentPage.toString(),
        page_size: itemsPerPage.toString()
      });

      const [peopleRes, rolesRes] = await Promise.all([
        fetch(`/api/people/?${params}`),
        fetch('/api/general-roles/?page_size=1000') // Fetch all roles to match with current page of people
      ]);

      const peopleData = await peopleRes.json();
      const rolesData = await rolesRes.json();

      const peopleArray = peopleData.results || [];
      const rolesArray = rolesData.results || [];

      const peopleWithRoles = peopleArray.map((person: Person) => {
        const role = rolesArray.find((r: any) => r.person === person.did);
        return {
          did: person.did,
          name: person.name,
          access_level: role?.access_level ?? null,
          role_id: role?.id
        };
      });

      setPeople(peopleWithRoles);
      setRoleTotalPages(peopleData.total_pages || 1);
    } catch (error) {
      console.error('Error fetching people with roles:', error);
      alert('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPeople = async () => {
    try {
      // Fetch all pages
      let allResults: Person[] = [];
      let nextUrl: string | null = '/api/people/';

      while (nextUrl) {
        const response = await fetch(nextUrl);
        const data = await response.json();
        allResults = allResults.concat(data.results || []);
        nextUrl = data.next;
      }

      setAllPeople(allResults);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  // ===== Handlers (from handlers.tsx) =====

  const handlers = useAdminHandlers({
    setSelectedOrg,
    setOrgDetailsOpen,
    setAddOrgOpen,
    setDeleteOrgOpen,
    setAddMemberOpen,
    setEditMemberOpen,
    setSelectedMember,
    setSelectedPerson,
    setAssignRoleOpen,
    setEditRoleOpen,
    setSubmitting,
    addOrgForm,
    addMemberForm,
    editMemberForm,
    assignRoleForm,
    editRoleForm,
    fetchOrganizations,
    fetchOrgMembers,
    fetchPeopleWithRoles,
    selectedOrg,
    selectedMember,
    selectedPerson,
  });

  const {
    handleOrgRowClick,
    handleAddOrganization,
    handleSubmitOrganization,
    handleDeleteOrganization,
    confirmDeleteOrganization,
    handleAddMember,
    handleSubmitAddMember,
    handleEditMember,
    handleSubmitEditMember,
    handleRemoveMember,
    handleAssignRole,
    handleSubmitAssignRole,
    handleEditRole,
    handleSubmitEditRole,
    handleRemoveRole,
  } = handlers;

  // ===== Page Change Handlers =====

  const handleOrgPageChange = (page: number) => {
    setOrgCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRolePageChange = (page: number) => {
    setRoleCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== Dropdown Options =====

  const personOptions = allPeople.map((p) => ({
    value: p.did,
    label: `${p.name} (${p.did})`
  }));

  const accessLevelOptions = [
    { value: '1', label: 'View' },
    { value: '2', label: 'Edit' }
  ];

  const globalAccessLevelOptions = [
    { value: '0', label: 'Needs Approval' },
    { value: '1', label: 'Organizer' },
    { value: '2', label: 'Admin' }
  ];

  // ===== Placeholder Data =====

  const callTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'sof_dev', label: 'Software Development' },
    { value: 'ally-reach', label: 'Ally Reach' }
  ];

  const callStatuses = [
    { value: '0', label: 'Open' },
    { value: '1', label: 'To Do' },
    { value: '2', label: 'In Progress' },
    { value: '3', label: 'Blocked' },
    { value: '4', label: 'Completed' }
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Page Header */}
        <div>
          <Title order={2}>Admin Management Console</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Manage organizations, roles, and system settings
          </Text>
        </div>

        <Divider />

        {/* Section 1: Organization Management */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => setOrgSectionOpen(!orgSectionOpen)}>
                <IconBuilding size={24} />
                <Title order={3}>Organization Management</Title>
                <ActionIcon variant="subtle" size="lg">
                  {orgSectionOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
              <Group gap="sm">
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAddOrganization}
                >
                  Add Organization
                </Button>
              </Group>
            </Group>

            <Collapse in={orgSectionOpen}>
              <OrganizationsTable
                organizations={organizations}
                loading={loading}
                onRowClick={handleOrgRowClick}
                onDelete={handleDeleteOrganization}
                showTitle={false}
                currentPage={orgCurrentPage}
                totalPages={orgTotalPages}
                onPageChange={handleOrgPageChange}
              />
            </Collapse>
          </Stack>
        </Paper>

        {/* Section 2: Role Management */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => setRoleSectionOpen(!roleSectionOpen)}>
                <IconUserCog size={24} />
                <Title order={3}>Role Management</Title>
                <ActionIcon variant="subtle" size="lg">
                  {roleSectionOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                </ActionIcon>
              </Group>
            </Group>

            <Collapse in={roleSectionOpen}>
              <RolesTable
                people={people}
                loading={loading}
                onAssignRole={handleAssignRole}
                onEditRole={handleEditRole}
                onRemoveRole={handleRemoveRole}
                showTitle={false}
                currentPage={roleCurrentPage}
                totalPages={roleTotalPages}
                onPageChange={handleRolePageChange}
              />
            </Collapse>
          </Stack>
        </Paper>

        {/* Section 3: Call Types & Statuses (Placeholder) */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => setConfigSectionOpen(!configSectionOpen)}>
              <IconSettings size={24} />
              <Title order={3}>System Configuration</Title>
              <ActionIcon variant="subtle" size="lg">
                {configSectionOpen ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
              </ActionIcon>
            </Group>

            <Collapse in={configSectionOpen}>
              <Text size="sm" c="dimmed">
                The following settings are currently hardcoded and require further development to become configurable.
              </Text>

              <Stack gap="lg" mt="md">
                <PlaceholderSection title="Call Types" items={callTypes} />
                <PlaceholderSection title="Call Statuses" items={callStatuses} />
              </Stack>
            </Collapse>
          </Stack>
        </Paper>
      </Stack>

      {/* ===== Modals ===== */}

      {/* Add Organization Modal */}
      <Modal
        opened={addOrgOpen}
        onClose={() => setAddOrgOpen(false)}
        title="Add New Organization"
        size="md"
      >
        <form onSubmit={addOrgForm.onSubmit(handleSubmitOrganization)}>
          <Stack gap="md">
            <TextInput
              label="Organization Name"
              placeholder="Enter organization name"
              required
              {...addOrgForm.getInputProps('name')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setAddOrgOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Organization
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Organization Details Modal */}
      <Modal
        opened={orgDetailsOpen}
        onClose={() => setOrgDetailsOpen(false)}
        title={selectedOrg?.name || 'Organization Details'}
        size="lg"
      >
        <Stack gap="md">
          <OrganizationMembersTable
            members={selectedOrgMembers}
            organizationName={selectedOrg?.name || ''}
            loading={orgDetailsLoading}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onRemoveMember={handleRemoveMember}
          />

          <Divider />

          <Group justify="flex-end">
            <Button
              variant="outline"
              color="red"
              onClick={() => setDeleteOrgOpen(true)}
            >
              Delete Organization
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        opened={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Add Member to Organization"
        size="md"
      >
        <form onSubmit={addMemberForm.onSubmit(handleSubmitAddMember)}>
          <Stack gap="md">
            <Select
              label="Person"
              placeholder="Select person"
              required
              data={personOptions}
              searchable
              {...addMemberForm.getInputProps('person')}
            />
            <Select
              label="Access Level"
              placeholder="Select access level"
              required
              data={accessLevelOptions}
              {...addMemberForm.getInputProps('access_level')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Add Member
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        opened={editMemberOpen}
        onClose={() => setEditMemberOpen(false)}
        title="Edit Member Access Level"
        size="md"
      >
        <form onSubmit={editMemberForm.onSubmit(handleSubmitEditMember)}>
          <Stack gap="md">
            <Text size="sm">
              Editing access level for <strong>{selectedMember?.name}</strong>
            </Text>
            <Select
              label="Access Level"
              placeholder="Select access level"
              required
              data={accessLevelOptions}
              {...editMemberForm.getInputProps('access_level')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setEditMemberOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Update Access Level
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Organization Confirmation Modal */}
      <Modal
        opened={deleteOrgOpen}
        onClose={() => setDeleteOrgOpen(false)}
        title="Confirm Delete Organization"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{selectedOrg?.name}</strong>?
          </Text>
          <Text size="sm" c="red">
            This action will remove all member associations and cascade to{' '}
            <strong>{selectedOrg?.event_count || 0}</strong> related events.
            This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setDeleteOrgOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDeleteOrganization} loading={submitting}>
              Delete Organization
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        opened={assignRoleOpen}
        onClose={() => setAssignRoleOpen(false)}
        title="Assign Role"
        size="md"
      >
        <form onSubmit={assignRoleForm.onSubmit(handleSubmitAssignRole)}>
          <Stack gap="md">
            <Text size="sm">
              Assigning role to <strong>{selectedPerson?.name}</strong>
            </Text>
            <Select
              label="Access Level"
              placeholder="Select access level"
              required
              data={globalAccessLevelOptions}
              {...assignRoleForm.getInputProps('access_level')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setAssignRoleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Assign Role
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        opened={editRoleOpen}
        onClose={() => setEditRoleOpen(false)}
        title="Edit Role"
        size="md"
      >
        <form onSubmit={editRoleForm.onSubmit(handleSubmitEditRole)}>
          <Stack gap="md">
            <Text size="sm">
              Editing role for <strong>{selectedPerson?.name}</strong>
            </Text>
            <Select
              label="Access Level"
              placeholder="Select access level"
              required
              data={globalAccessLevelOptions}
              {...editRoleForm.getInputProps('access_level')}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={() => setEditRoleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Update Role
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
