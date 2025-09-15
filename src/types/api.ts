// API Types for the freelancer platform
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'client' | 'freelancer' | 'admin';
  handle?: string;
  country?: string;
  timezone?: string;
  kycStatus?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'client' | 'freelancer';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Profile {
  userId: number;
  headline?: string;
  bio?: string;
  hourlyRateCents?: number;
  currency?: string;
  availability: 'FULL_TIME' | 'PART_TIME' | 'OCCASIONAL' | 'UNAVAILABLE';
  languages?: string[];
  skills?: string[];
  locationText?: string;
  githubUsername?: string;
  gitlabUsername?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  deliveryScore: number;
  reviewAvg: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Gig {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  skills?: string[];
  price: number;
  startingPrice?: number;
  delivery_time: number;
  deliveryDays?: number;
  freelancer_id: number;
  freelancerInfo?: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
  rating?: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GigPackage {
  id: number;
  gigId: number;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  deliveryDays: number;
  revisions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  clientId: number;
  projectName: string;
  description: string;
  category?: string;
  skills?: string[];
  isUrgent?: boolean;
  budgetType: 'FIXED' | 'HOURLY';
  minBudgetCents?: number;
  maxBudgetCents?: number;
  ndaRequired?: boolean;
  ipAssignment?: boolean;
  status: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  // Legacy fields for backward compatibility
  title?: string;
  budget?: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: Date | string;
  client?: {
    id: number;
    name: string;
    email?: string;
  };
  created_at?: Date;
}

export interface Proposal {
  id: number;
  jobId: number;
  freelancerId: number;
  cover: string;
  totalCents: number;
  currency: string;
  deliveryDays: number;
  status: 'SUBMITTED' | 'WITHDRAWN' | 'DECLINED' | 'ACCEPTED';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Chat System Types
export interface Message {
  id: number | string; // Allow string for temporary IDs
  conversationId: number;
  senderId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface Conversation {
  id: number;
  participantIds: number[];
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

// For conversations based on direct messages
export interface ChatConversation {
  otherUser: User;
  lastMessageTime: string;
  lastMessageContent?: string;
  unreadCount?: number;
}

export interface SendMessageRequest {
  senderId: string;
  receiverId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  replyToId?: string;
  attachments?: {
    filename: string;
    url: string;
    contentType: string;
    fileSize: number;
  }[];
}

export interface CreateConversationRequest {
  participantIds: number[];
  initialMessage?: string;
}
