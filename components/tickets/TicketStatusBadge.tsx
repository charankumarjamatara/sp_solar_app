import React from 'react';
import { StatusPill, StatusPillProps } from '../ui/StatusPill';

export type TicketStatusBadgeProps = StatusPillProps;

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = props => {
  return <StatusPill {...props} />;
};
