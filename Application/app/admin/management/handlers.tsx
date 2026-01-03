import { type Organization } from '@/app/components/OrganizationsTable';
import { type GroupMember } from '@/app/components/OrganizationMembersTable';
import { type PersonWithRole } from '@/app/components/RolesTable';

interface UseHandlersProps {
  // State setters
  setSelectedOrg: (org: Organization | null) => void;
  setOrgDetailsOpen: (open: boolean) => void;
  setAddOrgOpen: (open: boolean) => void;
  setDeleteOrgOpen: (open: boolean) => void;
  setAddMemberOpen: (open: boolean) => void;
  setEditMemberOpen: (open: boolean) => void;
  setSelectedMember: (member: GroupMember | null) => void;
  setSelectedPerson: (person: PersonWithRole | null) => void;
  setAssignRoleOpen: (open: boolean) => void;
  setEditRoleOpen: (open: boolean) => void;
  setSubmitting: (submitting: boolean) => void;

  // Forms
  addOrgForm: any;
  addMemberForm: any;
  editMemberForm: any;
  assignRoleForm: any;
  editRoleForm: any;

  // Fetch functions
  fetchOrganizations: () => Promise<void>;
  fetchOrgMembers: (gid: number) => Promise<void>;
  fetchPeopleWithRoles: () => Promise<void>;

  // Current selections
  selectedOrg: Organization | null;
  selectedMember: GroupMember | null;
  selectedPerson: PersonWithRole | null;
}

export function useAdminHandlers(props: UseHandlersProps) {
  const {
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
  } = props;

  // ===== Organization Handlers =====

  const handleOrgRowClick = (org: Organization) => {
    setSelectedOrg(org);
    setOrgDetailsOpen(true);
  };

  const handleAddOrganization = () => {
    addOrgForm.reset();
    setAddOrgOpen(true);
  };

  const handleSubmitOrganization = async (values: any) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) throw new Error('Failed to create organization');

      setAddOrgOpen(false);
      addOrgForm.reset();
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteOrgOpen(true);
  };

  const confirmDeleteOrganization = async () => {
    if (!selectedOrg) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/groups/${selectedOrg.gid}/`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete organization');

      setDeleteOrgOpen(false);
      setOrgDetailsOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      alert('Failed to delete organization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Member Handlers =====

  const handleAddMember = () => {
    addMemberForm.reset();
    setAddMemberOpen(true);
  };

  const handleSubmitAddMember = async (values: any) => {
    if (!selectedOrg) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/volunteer-in-groups/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: values.person,
          group: selectedOrg.gid,
          access_level: parseInt(values.access_level)
        })
      });

      if (!response.ok) throw new Error('Failed to add member');

      setAddMemberOpen(false);
      addMemberForm.reset();
      fetchOrgMembers(selectedOrg.gid);
      fetchOrganizations(); // Refresh member counts
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. They may already be in this organization.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = (member: GroupMember) => {
    setSelectedMember(member);
    editMemberForm.setValues({ access_level: member.access_level.toString() });
    setEditMemberOpen(true);
  };

  const handleSubmitEditMember = async (values: any) => {
    if (!selectedMember || !selectedOrg) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/volunteer-in-groups/${selectedMember.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_level: parseInt(values.access_level)
        })
      });

      if (!response.ok) throw new Error('Failed to update member');

      setEditMemberOpen(false);
      fetchOrgMembers(selectedOrg.gid);
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Failed to update member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = (member: GroupMember) => {
    if (!confirm(`Remove ${member.name} from this organization?`)) return;
    if (!selectedOrg) return;

    setSubmitting(true);
    fetch(`/api/volunteer-in-groups/${member.id}/`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to remove member');
        fetchOrgMembers(selectedOrg.gid);
        fetchOrganizations(); // Refresh member counts
      })
      .catch((error) => {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  // ===== Role Handlers =====

  const handleAssignRole = (person: PersonWithRole) => {
    setSelectedPerson(person);
    assignRoleForm.reset();
    setAssignRoleOpen(true);
  };

  const handleSubmitAssignRole = async (values: any) => {
    if (!selectedPerson) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/general-roles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person: selectedPerson.did,
          access_level: parseInt(values.access_level)
        })
      });

      if (!response.ok) throw new Error('Failed to assign role');

      setAssignRoleOpen(false);
      assignRoleForm.reset();
      fetchPeopleWithRoles();
    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRole = (person: PersonWithRole) => {
    setSelectedPerson(person);
    editRoleForm.setValues({ access_level: person.access_level?.toString() || '1' });
    setEditRoleOpen(true);
  };

  const handleSubmitEditRole = async (values: any) => {
    if (!selectedPerson || !selectedPerson.role_id) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/general-roles/${selectedPerson.role_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_level: parseInt(values.access_level)
        })
      });

      if (!response.ok) throw new Error('Failed to update role');

      setEditRoleOpen(false);
      fetchPeopleWithRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = (person: PersonWithRole) => {
    if (!person.role_id) return;
    if (!confirm(`Remove role for ${person.name}? The person will remain in the system.`)) return;

    setSubmitting(true);
    fetch(`/api/general-roles/${person.role_id}/`, {
      method: 'DELETE'
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to remove role');
        fetchPeopleWithRoles();
      })
      .catch((error) => {
        console.error('Error removing role:', error);
        alert('Failed to remove role. Please try again.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return {
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
  };
}
