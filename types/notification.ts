/**
 * Notification Types for SNP Solar Customers
 */

export type NotificationType =
  | 'TICKET_CREATED'
  | 'TECHNICIAN_ASSIGNED'
  | 'REPAIR_STARTED'
  | 'REPAIR_COMPLETED'
  | 'TICKET_RESOLVED'
  | 'FEEDBACK_REQUEST'
  | 'ANNOUNCEMENT'
  | 'MAINTENANCE_REMINDER';

export interface Notification {
  id: string;
  customerId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  ticketId?: string;
  ticketNumber?: string;
  category?: 'TICKET' | 'SERVICE_UPDATE';
  data?: Record<string, unknown>;
  createdAt: string;
}
