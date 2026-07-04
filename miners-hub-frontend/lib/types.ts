/**
 * Central TypeScript Types & Data Models
 * 
 * Comprehensive type definitions for all data models in the application.
 * Types are organized by domain and match backend entity structure.
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * User roles in the system
 */
export enum UserRole {
  MINER = 'miner',
  INVESTOR = 'investor',
  GOVERNMENT = 'government',
  ADMIN = 'admin',
}

/**
 * User verification status
 */
export enum VerificationStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  REJECTED = 'rejected',
  NEW = 'new',
}

/**
 * Listing status
 */
export enum ListingStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  PENDING = 'pending',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
}

/**
 * Listing type (union type for flexibility)
 */
export type ListingType = 'buy-now' | 'auction';

/**
 * Auction status (union type)
 */
export type AuctionStatus = 'active' | 'ended' | 'cancelled';

/**
 * Order status
 */
export enum OrderStatus {
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Contract status
 */
export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_MINER_SIGNATURE = 'pending_miner_signature',
  PENDING_INVESTOR_SIGNATURE = 'pending_investor_signature',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  TERMINATED = 'terminated',
  REJECTED = 'rejected',
}

/**
 * Payment status (union type)
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/**
 * Document type
 */
export enum DocumentType {
  IDENTIFICATION = 'identification',
  BUSINESS_LICENSE = 'business_license',
  MINING_PERMIT = 'mining_permit',
  CERTIFICATE = 'certificate',
  CONTRACT = 'contract',
  INVOICE = 'invoice',
  OTHER = 'other',
}

/**
 * Notification type (union type for flexibility)
 */
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

/**
 * Task status
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
}

/**
 * Task priority
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Transaction status (union type)
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed';

/**
 * Unit of measurement
 */
export type Unit = 'tonne' | 'kg' | 'gram';

/**
 * Risk appetite level
 */
export type RiskAppetite = 'low' | 'medium' | 'high';

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User document
 */
export interface UserDocument {
  name: string;
  url: string; // base64 data URL or file URL
}

/**
 * Core user type matching backend entity
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  onboardingComplete: boolean;
  status: VerificationStatus;
  profileImageUrl?: string;
  
  // Personal Info
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  nin?: string;
  
  // Business Info
  businessName?: string;
  companyRegNumber?: string;
  businessAddress?: string;
  businessWebsite?: string;
  industry?: string;
  yearsInOperation?: string;
  
  // Miner-specific Info
  miningEquipment?: string[];
  certifications?: string[];
  
  // Investor-specific Info
  investmentPreferences?: string[];
  riskAppetite?: RiskAppetite | null;
  
  // Government-specific info
  jurisdiction?: string;
  
  // Documents
  documents?: { [key: string]: UserDocument[] };
  
  // Settings
  notificationSettings?: {
    marketUpdates: boolean;
    platformAnnouncements: boolean;
  };
  twoFactorEnabled?: boolean;
  
  // Relationships (optional full objects)
  tasks?: Task[];
  transactions?: Transaction[];
}

/**
 * Miner-specific type with relationships
 */
export interface Miner {
  id: string;
  userId: string;
  name: string;
  location: string;
  minerals: string[];
  rating: number;
  imageUrl: string;
  contactEmail: string;
  history: string;
  siteImages: string[];
  // Relationship
  user?: User;
}

/**
 * Investor-specific type with relationships
 */
export interface Investor {
  id: string;
  userId: string;
  investmentPreferences?: string[];
  riskAppetite?: RiskAppetite;
  // Relationship
  user?: User;
}

// ============================================================================
// MARKETPLACE TYPES
// ============================================================================

/**
 * Listing type matching backend entity
 */
export interface Listing {
  id: string;
  minerId: string;
  minerUserId?: string;
  mineral: string;
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  grade: string;
  location: string;
  description: string;
  images: string[];
  status: ListingStatus;
  type: ListingType;
  datePosted: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  miner?: User;
  // Display fields (for UI convenience)
  minerName?: string;
  minerImageUrl?: string;
}

/**
 * Bid type for auctions
 */
export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  date: string; // ISO 8601
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  bidder?: User;
  // Display fields (for UI convenience)
  bidderName?: string;
}

/**
 * Auction type matching backend entity
 */
export interface Auction {
  id: string;
  minerId: string;
  minerUserId?: string;
  mineral: string;
  quantity: number;
  unit: Unit;
  startingBid: number;
  currentBid: number;
  highestBidderId: string | null;
  auctionEndDate: string; // ISO 8601
  bidHistory: Bid[];
  grade: string;
  location: string;
  description: string;
  images: string[];
  status: AuctionStatus;
  datePosted: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  miner?: User;
  highestBidder?: User;
  // Display fields (for UI convenience)
  minerName?: string;
  minerImageUrl?: string;
  highestBidderName?: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * Order status history item
 */
export interface OrderStatusHistoryItem {
  status: OrderStatus;
  date: string; // ISO 8601
  location: string;
  notes?: string;
}

/**
 * Order type matching backend entity
 */
export interface Order {
  id: string;
  transactionId: string;
  listingId: string;
  mineral: string;
  quantity: number;
  unit: Unit;
  totalAmount: number;
  orderDate: string; // ISO 8601
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  shippingAddress: string;
  statusHistory: OrderStatusHistoryItem[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  buyer?: User;
  seller?: User;
  listing?: Listing;
  // Display fields (for UI convenience)
  buyerName?: string;
  sellerName?: string;
}

/**
 * Transaction type
 */
export interface Transaction {
  id: string;
  type?: string;
  listingId: string;
  orderId: string;
  mineral: string;
  amount: number;
  quantity: number;
  unit: string;
  date: string; // ISO 8601
  status: TransactionStatus;
  buyerId: string;
  sellerId: string;
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  buyer?: User;
  seller?: User;
  // Display fields (for UI convenience)
  sellerName?: string;
}

/**
 * Contract signature
 */
export interface ContractSignature {
  userId: string;
  userName: string;
  signatureDataUrl: string; // base64 data URL from canvas
  signedAt: string; // ISO 8601
}

/**
 * Contract type matching backend entity
 */
export interface Contract {
  id: string;
  listingId: string;
  mineral: string;
  minerId: string;
  investorId: string;
  terms: string;
  status: ContractStatus;
  investorSignature?: ContractSignature;
  minerSignature?: ContractSignature;
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  miner?: User;
  investor?: User;
  listing?: Listing;
  // Display fields (for UI convenience)
  minerName?: string;
  investorName?: string;
}

// ============================================================================
// COMMUNICATION TYPES
// ============================================================================

/**
 * Chat message type
 */
export interface ChatMessage {
  id: string;
  chatThreadId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO 8601
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  sender?: User;
  // Display fields (for UI convenience)
  senderName?: string;
}

/**
 * Chat thread type
 */
export interface Chat {
  id: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  lastMessageAt?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  participants?: User[];
  messages?: ChatMessage[];
}

/**
 * Notification type matching backend entity
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO 8601
  read: boolean;
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  user?: User;
}

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

/**
 * Document type matching backend entity
 */
export interface Document {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  url: string; // File URL or base64 data URL
  mimeType?: string;
  size?: number; // in bytes
  uploadedAt: string; // ISO 8601
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  user?: User;
}

// ============================================================================
// ADDITIONAL TYPES (from PRD)
// ============================================================================

/**
 * Event type
 */
export interface Event {
  id: string;
  title: string;
  date: string; // ISO 8601
  location: string;
  imageUrl: string;
  description?: string;
  registrationUrl?: string | null;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Mineral price type
 */
export interface MineralPrice {
  name: string;
  price: number;
  change: number;
  symbol: string;
}

/**
 * Map location data type
 */
export interface MapLocationData {
  id: string;
  name: string;
  minerals: string[];
  factories: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Testimonial type
 */
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  videoThumbnailUrl: string;
  videoUrl: string;
}

/**
 * News article type
 */
export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  imageUrl: string;
  author: string;
  date: string; // ISO 8601
  summary: string;
  content?: string;
  country?: string;
  isHeadline?: boolean;
  isBreaking?: boolean;
}

/**
 * Webinar type
 */
export interface Webinar {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  speaker: string;
  date: string; // ISO 8601
}

/**
 * Knowledge base article type
 */
export interface KnowledgeBaseArticle {
  id: string;
  category: string;
  title: string;
  content: string;
  tags: string[];
  createdAt?: string; // ISO 8601
}

/**
 * Forum reply type
 */
export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  date: string; // ISO 8601
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  author?: User;
  // Display fields (for UI convenience)
  authorName?: string;
}

/**
 * Forum post type
 */
export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  date: string; // ISO 8601
  replies: ForumReply[];
  tags: string[];
  createdAt: string; // ISO 8601
  // Relationships (optional full objects)
  author?: User;
  // Display fields (for UI convenience)
  authorName?: string;
}

/**
 * Task type
 */
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string; // ISO 8601
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  // Relationships (optional full objects)
  user?: User;
}

// ============================================================================
// DATA ANALYTICS TYPES
// ============================================================================

/**
 * Production data point
 */
export interface ProductionDataPoint {
  month: string;
  [mineral: string]: number | string;
}

/**
 * Price correlation
 */
export interface PriceCorrelation {
  mineralA: string;
  mineralB: string;
  correlation: number;
}

/**
 * Export data
 */
export interface ExportData {
  country: string;
  volume: number; // in thousand tonnes
}

/**
 * Market sentiment
 */
export interface MarketSentiment {
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  value: number; // e.g. 75 for 75%
}

/**
 * Historical price point
 */
export interface HistoricalPricePoint {
  date: string; // YYYY-MM-DD
  price: number;
}

/**
 * Mineral history
 */
export interface MineralHistory {
  [mineral: string]: HistoricalPricePoint[];
}

/**
 * Forecast data point
 */
export interface ForecastDataPoint {
  date: string;
  demand: number;
  type: 'historical' | 'forecast';
}

// ============================================================================
// LOGISTICS TYPES
// ============================================================================

/**
 * Shipment status
 */
export interface ShipmentStatus {
  status: 'pending' | 'in-transit' | 'at-port' | 'customs' | 'delivered';
  location: string;
  timestamp: string; // ISO 8601
  notes: string;
}

/**
 * Shipment type
 */
export interface Shipment {
  trackingId: string;
  origin: string;
  destination: string;
  currentStatus: ShipmentStatus['status'];
  estimatedDelivery: string; // ISO 8601
  history: ShipmentStatus[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
