import { TicketCategory, TicketStatus } from '../types/ticket';
import { colors } from '../constants/colors';

/**
 * Format ISO date string into readable format (e.g. "Oct 12, 2026")
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format ISO date string into date & time format (e.g. "Oct 12, 2026 at 2:30 PM")
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

/**
 * Format relative time (e.g., "just now", "2 hours ago")
 */
export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(dateString);
  } catch {
    return dateString;
  }
};

/**
 * Map ticket and service status enum to human-readable title
 */
export const getTicketStatusLabel = (status: TicketStatus | string): string => {
  switch (status) {
    case 'RAISED':
      return 'Raised';
    case 'ASSIGNED':
      return 'Assigned';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    case 'ACTIVE':
      return 'Active';
    case 'UNDER_MAINTENANCE':
      return 'Maintenance';
    case 'INACTIVE':
      return 'Inactive';
    case 'PENDING_INSPECTION':
      return 'Pending Inspection';
    default:
      return String(status).replace(/_/g, ' ');
  }
};

/**
 * Get ticket and service status color styling tokens
 */
export const getTicketStatusTheme = (status: TicketStatus | string) => {
  switch (status) {
    case 'RAISED':
      return colors.status.raised;
    case 'ASSIGNED':
      return colors.status.assigned;
    case 'IN_PROGRESS':
    case 'UNDER_MAINTENANCE':
      return colors.status.inProgress;
    case 'RESOLVED':
    case 'ACTIVE':
      return colors.status.resolved;
    case 'CLOSED':
    case 'INACTIVE':
      return colors.status.closed;
    case 'PENDING_INSPECTION':
      return colors.status.raised;
    default:
      return colors.status.closed;
  }
};

/**
 * Map ticket category enum to human-readable label
 */
export const getTicketCategoryLabel = (category: TicketCategory): string => {
  switch (category) {
    case 'INVERTER_FAULT':
      return 'Inverter Fault';
    case 'PANEL_DAMAGE':
      return 'Solar Panel Damage';
    case 'GENERATION_DROP':
      return 'Low Power Generation';
    case 'WIRING_ELECTRICAL':
      return 'Wiring & Electrical';
    case 'PHYSICAL_STRUCTURE':
      return 'Mounting & Structure';
    case 'ROUTINE_MAINTENANCE':
      return 'Routine Maintenance';
    case 'OTHER':
      return 'General Issue';
    default:
      return category;
  }
};

/**
 * Format solar capacity in kW
 */
export const formatCapacity = (kw?: number): string => {
  if (kw === undefined || kw === null) return '0 kW';
  return `${kw.toFixed(1)} kW`;
};
