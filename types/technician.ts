/**
 * Technician Types
 */

export interface Technician {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  avatarUrl?: string;
  rating?: number;
  specialization?: string;
  assignedAt?: string;
}
