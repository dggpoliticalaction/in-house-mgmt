/**
 * Returns a color string based on priority level.
 * Lower priority numbers are more urgent.
 *
 * @param priority - Priority level (0-5, where 0 is highest priority)
 * @returns Color string for use with Mantine Badge
 */
export const getPriorityColor = (priority: number): string => {
  if (priority < 1) return 'red';
  if (priority < 3) return 'orange';
  if (priority === 3) return 'yellow';
  if (priority <= 5) return 'gray';
  return 'gray';
};

/**
 * Returns a color string based on ticket status.
 *
 * @param status - Status string (OPEN, TODO, IN_PROGRESS, BLOCKED, COMPLETED, CANCELED)
 * @returns Color string for use with Mantine Badge
 */
export const getStatusColor = (status: string): string => {
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

/**
 * Formats a date string for display.
 *
 * @param dateString - ISO date string or null
 * @returns Formatted date string (e.g., "Jan 15, 2025") or "No date"
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Formats contact information (email and phone) for display.
 *
 * @param email - Email address or null
 * @param phone - Phone number or null
 * @returns Formatted contact string with bullet separator, or "No contact info"
 */
export const formatContact = (email: string | null, phone: string | null): string => {
  const parts = [];
  if (email) parts.push(email);
  if (phone) parts.push(phone);
  return parts.length > 0 ? parts.join(' • ') : 'No contact info';
};
