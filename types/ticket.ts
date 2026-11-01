import { Technician } from './technician';
import { TicketFeedback } from './feedback';

/**
 * Ticket Status Life Cycle:
 * RAISED -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
 */
export type TicketStatus = 'RAISED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type TicketCategory =
  | 'INVERTER_FAULT'
  | 'PANEL_DAMAGE'
  | 'GENERATION_DROP'
  | 'WIRING_ELECTRICAL'
  | 'PHYSICAL_STRUCTURE'
  | 'ROUTINE_MAINTENANCE'
  | 'OTHER';

export type TicketImageStage = 'CUSTOMER_ISSUE' | 'BEFORE_REPAIR' | 'AFTER_REPAIR';

export interface TicketImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  stage: TicketImageStage;
  caption?: string;
  uploadedAt: string;
  uploadedBy?: 'CUSTOMER' | 'TECHNICIAN';
}

export interface TicketResolution {
  resolvedAt: string;
  technicianNotes: string;
  partsReplaced?: string[];
  rootCause?: string;
}

export interface TicketStatusUpdate {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  installationId: string;
  category: TicketCategory;
  categoryLabel?: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedAt?: string;
  inProgressAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  technician?: Technician | null;
  images: TicketImage[];
  updates?: TicketStatusUpdate[];
  resolution?: TicketResolution | null;
  feedback?: TicketFeedback | null;
}

export interface CreateTicketPayload {
  installationId?: string;
  category: TicketCategory;
  description: string;
  imageUris?: string[];
}

export interface TicketFilterOptions {
  status?: TicketStatus | 'ALL';
  category?: TicketCategory;
  startDate?: string;
  endDate?: string;
  search?: string;
}
