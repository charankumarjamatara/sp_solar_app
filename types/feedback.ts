/**
 * Customer Feedback and Rating Types
 */

export interface TicketFeedback {
  id: string;
  ticketId: string;
  customerId: string;
  rating: number; // 1 - 5 stars
  categories?: string[];
  comment?: string;
  createdAt: string;
  technicianPunctuality?: number;
  workQuality?: number;
}

export interface SubmitFeedbackPayload {
  ticketId: string;
  rating: number;
  categories?: string[];
  comment?: string;
  technicianPunctuality?: number;
  workQuality?: number;
}
