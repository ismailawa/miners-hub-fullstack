/**
 * API Client Index
 * 
 * Central export point for all API services and utilities.
 */

// Export centralized client
export { ApiClient, apiClient, default as client } from './client';

// Export token utilities
export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
  hasValidToken,
} from './token';

// Export error utilities
export {
  type ApiError,
  getUserFriendlyMessage,
  isApiError,
  createApiErrorFromResponse,
  createNetworkError,
  createTimeoutError,
} from './errors';

// Export common types
export type {
  HttpMethod,
  RequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  InterceptorConfig,
  ApiClientConfig,
} from './types';

// Export auth service
export {
  login,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
} from './auth';

// Export notification service
export {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  type CreateNotificationRequest,
} from './notifications';

// Export user service
export { getProfile, updateProfile } from './users';

// Export listing service
export {
  getPublishedListings,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  mapBackendListingToFrontend,
  mapBackendListingToAuction,
  type BackendListing,
  type CreateListingPayload,
  type ListingFilterPayload,
} from './listings';

// Export auction service
export { getActiveAuctions, getAuction, placeBid, getAuctionBids } from './auctions';

// Export contract service
export {
  getContracts,
  getContract,
  proposeContract,
  updateContractStatus,
  signContract,
  type BackendContract,
  type ProposeContractPayload,
  type SignContractPayload,
  type UpdateContractStatusPayload,
} from './contracts';

// Export order service
export {
  getOrders,
  getOrder,
  createOrder,
  confirmPayment,
  initiateEscrowPayment,
  updateOrderStatus,
  type BackendOrder,
  type BackendEscrowTransaction,
  type BackendPayoutAccount,
  type CreateOrderPayload,
  type UpdateOrderStatusPayload,
} from './orders';

// Export chat service
export {
  getChatThreads,
  getChatMessages,
  sendMessage,
  type BackendThread,
  type BackendMessage,
} from './chats';

export {
  connectChatSocket,
  joinThread,
  leaveThread,
  sendSocketMessage,
  onChatMessage,
  onChatError,
  isChatSocketConnected,
} from './chat-socket';

// Export document service
export {
  uploadDocument,
  getDocument,
  downloadDocument,
  downloadDocumentFile,
  deleteDocument,
} from './documents';

// Export media service
export {
  uploadImage,
  type MediaUploadContext,
  type MediaUploadResult,
} from './media';

// Re-export types from central types file
export type {
  // Enums
  UserRole,
  VerificationStatus,
  ListingStatus,
  ListingType,
  AuctionStatus,
  OrderStatus,
  ContractStatus,
  PaymentStatus,
  DocumentType,
  NotificationType,
  TaskStatus,
  TaskPriority,
  TransactionStatus,
  Unit,
  RiskAppetite,
  // User Types
  User,
  UserDocument,
  Miner,
  Investor,
  // Marketplace Types
  Listing,
  Bid,
  Auction,
  // Transaction Types
  Order,
  OrderStatusHistoryItem,
  Transaction,
  Contract,
  ContractSignature,
  // Communication Types
  Chat,
  ChatMessage,
  Notification,
  // Document Types
  Document,
  // Additional Types
  Event,
  MineralPrice,
  MapLocationData,
  Testimonial,
  NewsArticle,
  Webinar,
  KnowledgeBaseArticle,
  ForumPost,
  ForumReply,
  Task,
  // Data Analytics Types
  ProductionDataPoint,
  PriceCorrelation,
  ExportData,
  MarketSentiment,
  HistoricalPricePoint,
  MineralHistory,
  ForecastDataPoint,
  // Logistics Types
  Shipment,
  ShipmentStatus,
  // Utility Types
  PaginationMeta,
  PaginatedResponse,
} from '../types';
