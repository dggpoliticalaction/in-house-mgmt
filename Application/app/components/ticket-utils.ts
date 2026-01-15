
export interface Ticket {
  id: number;
  ticket_status: string;
  status_display?: string;
  contact: string | null;
  title: string;
  description: string;
  ticket_type: string;
  type_display?: string;
  priority: number;
  created_at: string;
  modified_at: string;
}