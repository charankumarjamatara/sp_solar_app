import { SolarInstallation } from './solar';

/**
 * Customer Profile Types
 */

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: CustomerAddress;
  avatarUrl?: string;
  installations?: SolarInstallation[];
  createdAt: string;
}
