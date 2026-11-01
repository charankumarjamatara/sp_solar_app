import { apiClient } from '../api/client';
import {
  CreateTicketPayload,
  PaginatedResponse,
  Ticket,
  TicketCategory,
  TicketFilterOptions,
} from '../../types';

export interface TicketSummaryStats {
  total: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  latestTicket?: Ticket | null;
}

export interface TicketCategoryItem {
  category: TicketCategory;
  label: string;
  description: string;
}

let MOCK_TICKETS: Ticket[] = [
  {
    id: 'tkt_1',
    ticketNumber: 'SP-1025',
    category: 'INVERTER_FAULT',
    categoryLabel: 'Inverter not working',
    description: 'The inverter displays a red warning light and the system is not generating power as expected.',
    status: 'RAISED',
    customerId: 'cus_1',
    installationId: 'inst_1',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updates: [
      {
        id: 'upd_1',
        title: 'Issue Raised',
        message: 'Your service request has been registered and is queued for technician assignment.',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      },
    ],
  },
  {
    id: 'tkt_2',
    ticketNumber: 'SP-1021',
    category: 'ROUTINE_MAINTENANCE',
    categoryLabel: 'Panel cleaning',
    description: 'Routine scheduled cleaning and inspection of rooftop solar panels.',
    status: 'ASSIGNED',
    customerId: 'cus_1',
    installationId: 'inst_1',
    images: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    technician: {
      id: 'tech_1',
      name: 'Arun Kumar',
      phoneNumber: '+91 98765 43210',
      specialization: 'Solar Inverter & Panel Specialist',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    updates: [
      {
        id: 'upd_2_1',
        title: 'Issue Raised',
        message: 'Your service request was submitted successfully.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'upd_2_2',
        title: 'Technician Assigned',
        message: 'Technician Arun Kumar has been assigned to inspect and clean the panels.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
  {
    id: 'tkt_3',
    ticketNumber: 'SP-1018',
    category: 'GENERATION_DROP',
    categoryLabel: 'Low power generation',
    description: 'System output dropped by over 40% compared to typical daily yield.',
    status: 'IN_PROGRESS',
    customerId: 'cus_1',
    installationId: 'inst_1',
    images: [
      {
        id: 'img_before_1',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
        stage: 'BEFORE_REPAIR',
        caption: 'Dust and loose wiring inspected on Array 2',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
      {
        id: 'img_before_2',
        url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=80',
        stage: 'BEFORE_REPAIR',
        caption: 'Inverter DC isolator terminal condition',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    inProgressAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    technician: {
      id: 'tech_1',
      name: 'Arun Kumar',
      phoneNumber: '+91 98765 43210',
      specialization: 'Solar PV Systems Specialist',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    updates: [
      {
        id: 'upd_3_1',
        title: 'Issue Raised',
        message: 'Service request raised for low power output.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: 'upd_3_2',
        title: 'Technician Assigned',
        message: 'Arun Kumar assigned and site visit scheduled.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      },
      {
        id: 'upd_3_3',
        title: 'Repair In Progress',
        message: 'Technician has reached the site and is testing string voltages.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'tkt_4',
    ticketNumber: 'SP-1007',
    category: 'OTHER',
    categoryLabel: 'Monitoring issue',
    description: 'Mobile app and inverter data logger were failing to transmit daily solar production data.',
    status: 'RESOLVED',
    customerId: 'cus_1',
    installationId: 'inst_1',
    images: [
      {
        id: 'img_res_before',
        url: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=600&auto=format&fit=crop&q=80',
        stage: 'BEFORE_REPAIR',
        caption: 'WiFi logger blinking red/offline',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
      {
        id: 'img_res_after',
        url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=600&auto=format&fit=crop&q=80',
        stage: 'AFTER_REPAIR',
        caption: 'Logger reconfigured and connected to router',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    inProgressAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    technician: {
      id: 'tech_2',
      name: 'Ramesh Patel',
      phoneNumber: '+91 98123 45678',
      specialization: 'IoT & Telemetry Diagnostics',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    resolution: {
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      technicianNotes: 'Our technician inspected the inverter connections, reconfigured the smart logger antenna, and corrected the reported fault.',
      rootCause: 'Data logger firmware de-sync after local router IP lease change.',
    },
    updates: [
      {
        id: 'upd_4_1',
        title: 'Issue Raised',
        message: 'Customer requested assistance with monitoring app sync.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: 'upd_4_2',
        title: 'Technician Assigned',
        message: 'Ramesh Patel assigned to reconfigure gateway.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: 'upd_4_3',
        title: 'Repair In Progress',
        message: 'Diagnostics and logger firmware patch applied.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      },
      {
        id: 'upd_4_4',
        title: 'Repair Completed',
        message: 'The reported issue has been addressed and cloud telemetry is restored.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ],
  },
  {
    id: 'tkt_5',
    ticketNumber: 'SP-0991',
    category: 'WIRING_ELECTRICAL',
    categoryLabel: 'Wiring inspection',
    description: 'Requested comprehensive inspection of DC cable conduit and MC4 connectors after monsoon storm.',
    status: 'CLOSED',
    customerId: 'cus_1',
    installationId: 'inst_1',
    images: [
      {
        id: 'img_c_before',
        url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
        stage: 'BEFORE_REPAIR',
        caption: 'Conduit sheath weathered by storm',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
      {
        id: 'img_c_after',
        url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=600&auto=format&fit=crop&q=80',
        stage: 'AFTER_REPAIR',
        caption: 'UV-stabilized protective conduit installed',
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 26).toISOString(),
        uploadedBy: 'TECHNICIAN',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
    assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
    inProgressAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 26).toISOString(),
    closedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
    technician: {
      id: 'tech_1',
      name: 'Arun Kumar',
      phoneNumber: '+91 98765 43210',
      specialization: 'High-Voltage Electrical Specialist',
      assignedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
    },
    resolution: {
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 26).toISOString(),
      technicianNotes: 'Inspected complete DC loop, crimped two new MC4 connectors, and sealed junction box.',
      partsReplaced: ['MC4 Connectors (Pair)', 'Weatherproof Flex Conduit (3m)'],
    },
    feedback: {
      id: 'fb_1',
      ticketId: 'tkt_5',
      customerId: 'cus_1',
      rating: 5,
      comment: 'Very professional, fast resolution, and showed all before and after photos.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
    },
    updates: [
      {
        id: 'upd_5_1',
        title: 'Issue Raised',
        message: 'Wiring inspection request submitted.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      },
      {
        id: 'upd_5_2',
        title: 'Technician Assigned',
        message: 'Arun Kumar assigned.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
      },
      {
        id: 'upd_5_3',
        title: 'Repair In Progress',
        message: 'Conduit resealing underway.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
      },
      {
        id: 'upd_5_4',
        title: 'Repair Completed',
        message: 'Wiring and insulation test verified 100% safe.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 26).toISOString(),
      },
      {
        id: 'upd_5_5',
        title: 'Ticket Closed',
        message: 'Ticket closed after customer verified and provided feedback.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 24).toISOString(),
      },
    ],
  },
];

class TicketService {
  /**
   * Fetch customer support tickets with optional status & category filters
   */
  async getTickets(
    filters?: TicketFilterOptions,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Ticket>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    let filtered = [...MOCK_TICKETS];
    if (filters?.status && filters.status !== 'ALL') {
      filtered = filtered.filter(t => t.status === filters.status);
    }
    
    // Sort by most recently updated
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return {
      items: filtered,
      total: filtered.length,
      page,
      pageSize,
      hasMore: false
    };
  }

  /**
   * Fetch a single ticket by its unique identifier
   */
  async getTicketById(ticketId: string): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const normalized = ticketId.replace(/^#/, '').toLowerCase();
    const ticket = MOCK_TICKETS.find(
      t => t.id.toLowerCase() === normalized || t.ticketNumber.toLowerCase() === normalized
    );
    if (!ticket) throw new Error('Ticket not found');
    return ticket;
  }

  /**
   * Create and raise a new service/maintenance ticket
   */
  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `SP-${Math.floor(1000 + Math.random() * 9000)}`,
      category: payload.category,
      categoryLabel: payload.category, // Simplification for mock
      description: payload.description,
      status: 'RAISED',
      customerId: 'cus_current',
      installationId: 'inst_current',
      images: (payload.imageUris || []).map((uri, index) => ({
        id: `img_${Date.now()}_${index}`,
        url: uri,
        stage: 'CUSTOMER_ISSUE',
        uploadedAt: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    MOCK_TICKETS = [newTicket, ...MOCK_TICKETS];

    // Trigger ticket-created notification in shared notificationService
    try {
      // Dynamic import or require to avoid circular dependency
      const { notificationService } = require('../notifications/notificationService');
      notificationService.addNotification({
        type: 'TICKET_CREATED',
        title: 'Service Request Registered',
        body: `Your service request #${newTicket.ticketNumber} for ${newTicket.categoryLabel || 'Solar Equipment'} has been submitted and queued for review.`,
        ticketId: newTicket.id,
        ticketNumber: newTicket.ticketNumber,
        category: 'TICKET',
      });
    } catch {
      // Gracefully continue if notification service is not reachable
    }

    return newTicket;
  }

  /**
   * Fetch dashboard statistics for the customer's solar installation tickets
   */
  async getTicketSummaryStats(): Promise<TicketSummaryStats> {
    const response = await apiClient.get<TicketSummaryStats>('/tickets/summary-stats');
    return response.data;
  }

  /**
   * Fetch available issue categories
   */
  async getCategories(): Promise<TicketCategoryItem[]> {
    const response = await apiClient.get<TicketCategoryItem[]>('/tickets/categories');
    return response.data;
  }
}

export const ticketService = new TicketService();
