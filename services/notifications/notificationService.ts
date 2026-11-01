import { Notification, PaginatedResponse, NotificationType } from '../../types';

let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    customerId: 'cus_1',
    type: 'TICKET_CREATED',
    title: 'Service Request Registered',
    body: 'Your service request #SP-1025 for Inverter Fault has been logged and queued for assignment.',
    isRead: false,
    ticketId: 'tkt_1',
    ticketNumber: 'SP-1025',
    category: 'TICKET',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 min ago
  },
  {
    id: 'notif_2',
    customerId: 'cus_1',
    type: 'TECHNICIAN_ASSIGNED',
    title: 'Technician Assigned',
    body: 'Arun Kumar has been assigned to inspect and clean your rooftop solar panels.',
    isRead: false,
    ticketId: 'tkt_2',
    ticketNumber: 'SP-1021',
    category: 'TICKET',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
  },
  {
    id: 'notif_3',
    customerId: 'cus_1',
    type: 'REPAIR_STARTED',
    title: 'Repair In Progress',
    body: 'Technician has reached your site and commenced string voltage diagnostics for ticket #SP-1018.',
    isRead: false,
    ticketId: 'tkt_3',
    ticketNumber: 'SP-1018',
    category: 'TICKET',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'notif_4',
    customerId: 'cus_1',
    type: 'TICKET_RESOLVED',
    title: 'Issue Resolved',
    body: 'Telemetry synchronization for ticket #SP-1007 is resolved. Please verify your monitoring app.',
    isRead: true,
    ticketId: 'tkt_4',
    ticketNumber: 'SP-1007',
    category: 'TICKET',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif_5',
    customerId: 'cus_1',
    type: 'FEEDBACK_REQUEST',
    title: 'Rate Your Experience',
    body: 'How was Ramesh Patel’s service on ticket #SP-1007? Tap to leave your quick rating.',
    isRead: false,
    ticketId: 'tkt_4',
    ticketNumber: 'SP-1007',
    category: 'TICKET',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), // 22 hours ago
  },
  {
    id: 'notif_6',
    customerId: 'cus_1',
    type: 'MAINTENANCE_REMINDER',
    title: 'Quarterly Monsoon Check Recommended',
    body: 'Ensure solar array mounting fasteners and wiring conduits are checked before the heavy rains.',
    isRead: true,
    category: 'SERVICE_UPDATE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'notif_7',
    customerId: 'cus_1',
    type: 'ANNOUNCEMENT',
    title: 'Grid Net-Metering Firmware Update',
    body: 'SP Solar cloud telemetry platform upgraded with improved real-time generation insights.',
    isRead: true,
    category: 'SERVICE_UPDATE',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
  },
];

type NotificationChangeListener = () => void;

class NotificationService {
  private listeners: NotificationChangeListener[] = [];

  /**
   * Subscribe to notification state changes across app components
   */
  subscribe(listener: NotificationChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.warn('Error in notification listener:', e);
      }
    });
  }

  /**
   * Fetch customer notifications with simulated network latency
   */
  async getNotifications(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PaginatedResponse<Notification>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Sort descending by creation date
    const sorted = [...MOCK_NOTIFICATIONS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      items: sorted,
      total: sorted.length,
      page,
      pageSize,
      hasMore: false,
    };
  }

  /**
   * Get total count of unread notifications for badge indicators
   */
  async getUnreadCount(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 150));
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n =>
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.notifyListeners();
  }

  /**
   * Mark all customer notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => ({ ...n, isRead: true }));
    this.notifyListeners();
  }

  /**
   * Programmatically add a notification when a ticket activity occurs
   */
  addNotification(params: {
    type: NotificationType;
    title: string;
    body: string;
    ticketId?: string;
    ticketNumber?: string;
    category?: 'TICKET' | 'SERVICE_UPDATE';
  }): Notification {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customerId: 'cus_1',
      type: params.type,
      title: params.title,
      body: params.body,
      isRead: false,
      ticketId: params.ticketId,
      ticketNumber: params.ticketNumber,
      category: params.category || (params.ticketId ? 'TICKET' : 'SERVICE_UPDATE'),
      createdAt: new Date().toISOString(),
    };

    MOCK_NOTIFICATIONS = [newNotif, ...MOCK_NOTIFICATIONS];
    this.notifyListeners();
    return newNotif;
  }

  /**
   * Register push notification token with backend (mock)
   */
  async registerPushToken(token: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Push token registered:', token);
  }
}

export const notificationService = new NotificationService();
