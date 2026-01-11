
export interface Ticket {
  id: number;
  ticket_status: string;
  contact: string | null;
  title: string;
  description: string;
  ticket_type: string;
  priority: number;
  created_at: string;
  modified_at: string;
}