import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '../../test-utils/render';
import RolesTable, { PersonWithRole } from './RolesTable';

describe('RolesTable', () => {
  const mockPeople: PersonWithRole[] = [
    { did: '123', name: 'Alice', access_level: null },
    { did: '456', name: 'Bob', access_level: 0 },
    { did: '789', name: 'Charlie', access_level: 1 },
    { did: '012', name: 'Diana', access_level: 2 },
  ];

  describe('access level labels', () => {
    it('displays "No Access" for null access_level', () => {
      render(<RolesTable people={[mockPeople[0]]} />);
      expect(screen.getByText('No Access')).toBeInTheDocument();
    });

    it('displays "Needs Approval" for access_level 0', () => {
      render(<RolesTable people={[mockPeople[1]]} />);
      expect(screen.getByText('Needs Approval')).toBeInTheDocument();
    });

    it('displays "Organizer" for access_level 1', () => {
      render(<RolesTable people={[mockPeople[2]]} />);
      expect(screen.getByText('Organizer')).toBeInTheDocument();
    });

    it('displays "Admin" for access_level 2', () => {
      render(<RolesTable people={[mockPeople[3]]} />);
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows empty message when no people', () => {
      render(<RolesTable people={[]} />);
      expect(screen.getByText(/no people found/i)).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('shows Assign button for person with no access', () => {
      const onAssign = vi.fn();
      render(<RolesTable people={[mockPeople[0]]} onAssignRole={onAssign} />);
      expect(screen.getByRole('button', { name: /assign/i })).toBeInTheDocument();
    });

    it('shows Edit and Remove buttons for person with access', () => {
      const onEdit = vi.fn();
      const onRemove = vi.fn();
      render(<RolesTable people={[mockPeople[2]]} onEditRole={onEdit} onRemoveRole={onRemove} />);
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('calls onAssignRole when Assign is clicked', async () => {
      const user = userEvent.setup();
      const onAssign = vi.fn();
      render(<RolesTable people={[mockPeople[0]]} onAssignRole={onAssign} />);
      await user.click(screen.getByRole('button', { name: /assign/i }));
      expect(onAssign).toHaveBeenCalledWith(mockPeople[0]);
    });
  });
});
