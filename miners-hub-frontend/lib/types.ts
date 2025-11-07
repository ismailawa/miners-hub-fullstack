/**
 * Central TypeScript Types & Data Models
 * Comprehensive type definitions for all data models in the application
 * Types match backend entity structure and PRD requirements
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User roles in the system
 */
export enum UserRole {
  MINER = "miner",
  INVESTOR = "investor",
  GOVERNMENT = "government",
  ADMIN = "admin",
}

/**
 * User verification status
 */
export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

/**
 * Listing status
 */
export enum ListingStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  PUBLISHED = "published",
  SOLD = "sold",
  EXPIRED = "expired",
  ARCHIVED = "archived",
}

/**
 * Listing type
 */
export type ListingType = "buy_now" | "auction";

/**
 * Order status
 */
export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Payment status
 */
export type PaymentStatus = "pending" | "paid" | "refunded";

/**
 * Contract status
 */
export enum ContractStatus {
  DRAFT = "draft",
  PROPOSED = "proposed",
  UNDER_REVIEW = "under_review",
  SIGNED = "signed",
  EXECUTED = "executed",
  TERMINATED = "terminated",
}

/**
 * Auction status
 */
export type AuctionStatus = "active" | "completed" | "cancelled";

/**
 * Document type
 */
export enum DocumentType {
  KYC = "kyc",
  MINING_LICENCE = "mining_licence",
  LISTING_ATTACHMENT = "listing_attachment",
  CONTRACT = "contract",
  OTHER = "other",
}

/**
 * Notification type
 */
export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Base user type
 */
export interface User {
  readonly id: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Miner profile
 */
export interface Miner {
  readonly id: string;
  userId: string;
  companyName: string;
  miningLicence: string | null;
  location: string; // State/LGA
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  user?: User;
  listings?: Listing[];
}

/**
 * Investor profile
 */
export interface Investor {
  readonly id: string;
  userId: string;
  companyName: string;
  investmentFocus: string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  user?: User;
  orders?: Order[];
}

// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

/**
 * Mineral listing
 */
export interface Listing {
  readonly id: string;
  minerId: string;
  mineralType: string;
  quantity: number; // in tons
  price: number;
  gradePurity: string | null;
  location: string | null; // State/LGA
  moisturePercentage: number | null;
  status: ListingStatus;
  listingType: ListingType;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  miner?: Miner;
  auctions?: Auction[];
  orders?: Order[];
  documents?: Document[];
}

/**
 * Auction
 */
export interface Auction {
  readonly id: string;
  listingId: string;
  startTime: string;
  endTime: string;
  startingBid: number;
  currentBid: number | null;
  minimumIncrement: number;
  status: AuctionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  listing?: Listing;
  bids?: Bid[];
}

/**
 * Bid on an auction
 */
export interface Bid {
  readonly id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  readonly createdAt: string;
  // Relationships (optional, populated when needed)
  auction?: Auction;
  bidder?: User;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * Order
 */
export interface Order {
  readonly id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  totalAmount: number;
  quantity: number;
  status: OrderStatus;
  deliveryAddress: string | null;
  paymentStatus: PaymentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  buyer?: User;
  seller?: User;
  listing?: Listing;
}

/**
 * Contract
 */
export interface Contract {
  readonly id: string;
  party1Id: string;
  party2Id: string;
  listingId: string | null;
  terms: string;
  metadata: Record<string, any> | null;
  status: ContractStatus;
  party1SignedAt: string | null;
  party2SignedAt: string | null;
  party1Signature: string | null;
  party2Signature: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  party1?: User;
  party2?: User;
  listing?: Listing;
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

/**
 * Chat message
 */
export interface Chat {
  readonly id: string;
  senderId: string;
  receiverId: string;
  threadId: string;
  message: string;
  read: boolean;
  readAt: string | null;
  readonly createdAt: string;
  // Relationships (optional, populated when needed)
  sender?: User;
  receiver?: User;
}

/**
 * Notification
 */
export interface Notification {
  readonly id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  readAt: string | null;
  notificationType: NotificationType;
  metadata: Record<string, any> | null;
  readonly createdAt: string;
  // Relationships (optional, populated when needed)
  user?: User;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Document
 */
export interface Document {
  readonly id: string;
  userId: string;
  listingId: string | null;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata: Record<string, any> | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  user?: User;
  listing?: Listing;
}

// ============================================================================
// ADDITIONAL TYPES (from PRD)
// ============================================================================

/**
 * Industry event
 */
export interface Event {
  readonly id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  organizer: string;
  registrationUrl: string | null;
  imageUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Mineral price data
 */
export interface MineralPrice {
  readonly id: string;
  mineralType: string;
  price: number;
  unit: string; // e.g., "per ton", "per kg"
  location: string | null; // State/LGA, null for national average
  source: string;
  date: string;
  readonly createdAt: string;
}

/**
 * Map location data for mineral deposits
 */
export interface MapLocationData {
  readonly id: string;
  name: string;
  state: string;
  lga: string; // Local Government Area
  coordinates: {
    lat: number;
    lng: number;
  };
  mineralTypes: string[];
  description: string | null;
  verified: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Testimonial
 */
export interface Testimonial {
  readonly id: string;
  authorName: string;
  authorRole: string;
  authorCompany: string | null;
  authorImageUrl: string | null;
  content: string;
  rating: number; // 1-5
  featured: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * News article
 */
export interface NewsArticle {
  readonly id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Webinar
 */
export interface Webinar {
  readonly id: string;
  title: string;
  description: string;
  presenter: string;
  presenterBio: string | null;
  scheduledDate: string;
  duration: number; // in minutes
  registrationUrl: string | null;
  recordingUrl: string | null;
  imageUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Knowledge base article
 */
export interface KnowledgeBaseArticle {
  readonly id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  views: number;
  helpful: number;
  notHelpful: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Forum post
 */
export interface ForumPost {
  readonly id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  replies: number;
  pinned: boolean;
  locked: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  author?: User;
}

/**
 * Task status
 */
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/**
 * Task (for task management features)
 */
export interface Task {
  readonly id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  // Relationships (optional, populated when needed)
  user?: User;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Audit log entry
 */
export interface AuditLog {
  readonly id: string;
  userId: string;
  action: string;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  readonly timestamp: string;
  // Relationships (optional, populated when needed)
  user?: User;
}

