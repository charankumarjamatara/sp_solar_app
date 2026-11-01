import { useState, useCallback, useEffect } from 'react';
import { Ticket, TicketFilterOptions } from '../types';
import { ticketService } from '../services/tickets/ticketService';
import { getErrorMessage } from '../utils/errors';

export const useTickets = (initialFilters?: TicketFilterOptions) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilterOptions>(
    initialFilters || { status: 'ALL' }
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const response = await ticketService.getTickets(filters);
        setTickets(response.items || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load tickets'));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const updateFilters = (newFilters: Partial<TicketFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refresh = () => fetchTickets(true);

  return {
    tickets,
    isLoading,
    isRefreshing,
    error,
    filters,
    updateFilters,
    refresh,
  };
};
