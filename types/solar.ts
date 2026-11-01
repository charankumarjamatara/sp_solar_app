/**
 * Solar Installation and Equipment Types
 */

export type InstallationStatus =
  'ACTIVE' | 'UNDER_MAINTENANCE' | 'INACTIVE' | 'PENDING_INSPECTION';

export interface SolarPanelInfo {
  model: string;
  count: number;
  totalCapacityKw: number;
}

export interface InverterInfo {
  model: string;
  serialNumber: string;
  capacityKw: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
}

export interface SolarInstallation {
  id: string;
  customerId: string;
  systemName: string;
  capacityKw: number;
  installationDate: string;
  status: InstallationStatus;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  panels: SolarPanelInfo;
  inverter: InverterInfo;
  warrantyExpiryDate: string;
}
