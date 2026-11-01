import { useState, useCallback, useEffect } from 'react';
import { Ticket } from '../types';
import { ticketService } from '../services/tickets/ticketService';
import { getErrorMessage } from '../utils/errors';

export const useTicketDetails = (ticketId?: string) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(
    async (isRefresh = false) => {
      if (!ticketId) return;

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await ticketService.getTicketById(ticketId);
        setTicket(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load ticket details'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ticketId]
  );

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const refresh = () => fetchTicket(true);

  return {
    ticket,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
};
