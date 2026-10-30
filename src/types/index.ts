export type ServiceCategory = 'todos' | 'corte' | 'barba' | 'combo' | 'acabamento';

export interface BarberService {
  id: string;
  name: string;
  category: 'corte' | 'barba' | 'combo' | 'acabamento';
  price: number;
  durationMinutes: number;
  description: string;
  popular?: boolean;
  badge?: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  experienceYears: number;
  avatarUrl: string;
  specialties: string[];
  bio: string;
  rating: number;
  reviewCount: number;
}

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  serviceId: string;
  barberId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  googleCalendarEventId?: string;
  googleTaskId?: string;
  googleReminderTaskId?: string;
  reminderScheduled?: boolean;
  gmailMessageId?: string;
  emailSent?: boolean;
}

export interface LoyaltyAccount {
  points: number;
  totalVisits: number;
  freeHaircutThreshold: number;
  tier: 'Bronze' | 'Prata' | 'Ouro VIP';
  vouchers: {
    id: string;
    title: string;
    code: string;
    createdAt: string;
    used: boolean;
  }[];
}

export interface Review {
  id: string;
  clientName: string;
  barberId: string;
  barberName: string;
  serviceName: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string[];
  author: string;
  authorRole: string;
  authorAvatar: string;
  category: string;
  readTime: string;
  coverImage: string;
  tags: string[];
  relatedServiceId: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  style: string;
  barberName: string;
  imageUrl: string;
  likes: number;
  description: string;
}

export interface SocialPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
  serviceTag: string;
}

export type NotificationType = 'upcoming' | 'reschedule' | 'status_change' | 'reminder';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  appointmentId?: string;
  metadata?: {
    clientName?: string;
    barberName?: string;
    serviceName?: string;
    date?: string;
    oldTime?: string;
    newTime?: string;
    newStatus?: string;
  };
}

