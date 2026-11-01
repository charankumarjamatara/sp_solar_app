import { SolarInstallation } from '../types/solar';
import { Ticket } from '../types/ticket';

export interface DashboardData {
  installation: SolarInstallation | null;
  activeTicket: Ticket | null;
  recentTickets: Ticket[];
}

export const mockDashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    return {
      installation: {
        id: 'inst_123',
        customerId: 'cus_mock_999',
        systemName: 'Residential System',
        capacityKw: 5.2,
        installationDate: '2026-03-12T00:00:00Z',
        status: 'ACTIVE',
        address: { street: '123 Solar Way', city: 'Sunnyville', state: 'CA', postalCode: '90210', country: 'USA' },
        panels: { model: 'SP-400W', count: 13, totalCapacityKw: 5.2 },
        inverter: { model: 'SolarEdge SE5000', serialNumber: 'SE12345', capacityKw: 5.0, status: 'ONLINE' },
        warrantyExpiryDate: '2036-03-12T00:00:00Z'
      },
      activeTicket: {
        id: 'tkt_3',
        ticketNumber: 'SP-1018',
        category: 'GENERATION_DROP',
        categoryLabel: 'Low power generation',
        status: 'IN_PROGRESS',
        description: 'System output dropped by over 40% compared to typical daily yield.',
        customerId: 'cus_mock_999',
        installationId: 'inst_123',
        images: [],
        technician: {
          id: 'tech_1',
          name: 'Arun Kumar',
          phoneNumber: '+91 98765 43210',
          specialization: 'Solar PV Systems Specialist',
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      recentTickets: [
        {
          id: 'tkt_4',
          ticketNumber: 'SP-1007',
          category: 'OTHER',
          categoryLabel: 'Monitoring issue',
          status: 'RESOLVED',
          description: 'Mobile app and inverter data logger were failing to transmit daily solar production data.',
          customerId: 'cus_mock_999',
          installationId: 'inst_123',
          images: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: 'tkt_5',
          ticketNumber: 'SP-0991',
          category: 'WIRING_ELECTRICAL',
          categoryLabel: 'Wiring inspection',
          status: 'CLOSED',
          description: 'Requested comprehensive inspection of DC cable conduit and MC4 connectors after monsoon storm.',
          customerId: 'cus_mock_999',
          installationId: 'inst_123',
          images: [],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
        }
      ]
    };
  }
};
