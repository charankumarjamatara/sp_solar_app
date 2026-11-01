import { SubmitFeedbackPayload, TicketFeedback } from '../../types';
import { ticketService } from '../tickets/ticketService';

class FeedbackService {
  /**
   * Submit customer feedback & star rating after ticket resolution
   */
  async submitFeedback(payload: SubmitFeedbackPayload): Promise<TicketFeedback> {
    await new Promise(resolve => setTimeout(resolve, 600));

    // Verify ticket exists in ticketService
    const ticket = await ticketService.getTicketById(payload.ticketId);

    // Business rule check: Ticket must be RESOLVED or CLOSED
    if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
      throw new Error('Feedback is only available after your issue has been resolved.');
    }

    // Business rule check: No duplicate submissions
    if (ticket.feedback) {
      throw new Error('Feedback has already been submitted for this ticket.');
    }

    const newFeedback: TicketFeedback = {
      id: `fb_${Date.now()}`,
      ticketId: ticket.id,
      customerId: ticket.customerId || 'cus_1',
      rating: payload.rating,
      categories: payload.categories || [],
      comment: payload.comment?.trim(),
      createdAt: new Date().toISOString(),
    };

    // Store in ticket mock state
    ticket.feedback = newFeedback;
    ticket.updatedAt = new Date().toISOString();

    return newFeedback;
  }

  /**
   * Retrieve existing feedback for a resolved ticket
   */
  async getFeedbackByTicketId(ticketId: string): Promise<TicketFeedback | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      return ticket.feedback || null;
    } catch {
      return null;
    }
  }
}

export const feedbackService = new FeedbackService();
