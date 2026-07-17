// ─────────────────────────────────────────────────────────────
// Tipos TypeScript — Kiyvo v4.0
// Tipagem completa para todo o ecossistema
// Comentários em PT-BR, variáveis em EN
// ─────────────────────────────────────────────────────────────

import type { ProductType, LicenseType, SellerPlan, SellerLevel, PaymentMethod, RiskCategory } from '@/domain/fees/FeeEngine'
import type { OrderStatus } from '@/domain/orders/OrderStateMachine'
import type { DeliveryType, DeliveryStatus } from '@/domain/delivery/DeliveryEngine'
import type { FeeCalculation } from '@/domain/fees/FeeEngine'

// ─── USER & AUTH ─────────────────────────────────────────────

export type UserRole =
  | 'guest'
  | 'buyer'
  | 'seller'
  | 'creator'
  | 'affiliate'
  | 'partner'
  | 'agency'
  | 'company'
  | 'moderator'
  | 'support_agent'
  | 'fraud_analyst'
  | 'finance_analyst'
  | 'content_manager'
  | 'admin'
  | 'super_admin'
  | 'founder'

export type VerificationLevel =
  | 'unverified'
  | 'email_verified'
  | 'identity_verified'
  | 'business_verified'
  | 'trusted'

export interface UserProfile {
  id: string
  username: string
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  phone: string | null
  cpf: string | null
  birthDate: string | null
  addressCep: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  addressNeighborhood: string | null
  addressCity: string | null
  addressState: string | null
  verificationStatus: VerificationLevel
  sellerPlan: SellerPlan
  sellerLevel: SellerLevel
  pdPoints: number
  totalSales: number
  totalPurchases: number
  rating: number
  reviewCount: number
  isAdmin: boolean
  isFounder: boolean
  isBanned: boolean
  bannedReason: string | null
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

// ─── PRODUCT ─────────────────────────────────────────────────

export interface Product {
  id: string
  sellerId: string
  categoryId: string
  title: string
  slug: string
  description: string
  price: number
  originalPrice: number | null
  productType: ProductType
  deliveryType: DeliveryType
  licenseTypes: LicenseType[]
  tags: string[]
  images: ProductImage[]
  version: string | null
  requirements: string | null
  compatibility: string | null
  stock: number
  salesCount: number
  viewsCount: number
  rating: number
  reviewCount: number
  isFeatured: boolean
  isDigital: boolean
  status: 'active' | 'paused' | 'sold_out' | 'removed' | 'under_review'
  createdAt: string
  updatedAt: string
  // Relacionamentos (carregados separadamente)
  seller?: SellerProfile
  category?: Category
  versions?: ProductVersion[]
}

export interface ProductImage {
  id: string
  productId: string
  imageUrl: string
  altText: string | null
  sortOrder: number
}

export interface ProductVersion {
  id: string
  productId: string
  version: string
  changelog: string | null
  fileUrl: string | null
  fileSize: number
  isLatest: boolean
  status: 'active' | 'deprecated' | 'yanked'
  createdAt: string
}

export interface ProductLicense {
  id: string
  productId: string
  licenseType: LicenseType
  name: string
  description: string
  priceModifier: number
  rights: Record<string, boolean>
  restrictions: Record<string, string>
}

// ─── SELLER ──────────────────────────────────────────────────

export interface SellerProfile {
  id: string
  username: string
  fullName: string | null
  avatarUrl: string | null
  verificationStatus: VerificationLevel
  sellerPlan: SellerPlan
  sellerLevel: SellerLevel
  totalSales: number
  rating: number
  reviewCount: number
  memberSince: string
  storeName: string | null
  storeSlug: string | null
  storeDescription: string | null
  storeCustomUrl: string | null
  followers: number
}

// ─── CATEGORY ────────────────────────────────────────────────

export type CategoryPermission = 'allowed' | 'restricted' | 'review_required' | 'prohibited'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  imageUrl: string | null
  parentId: string | null
  permission: CategoryPermission
  productCount: number
  sortOrder: number
  isActive: boolean
  children?: Category[]
}

// ─── CART ────────────────────────────────────────────────────

export interface CartItem {
  id: string
  userId: string
  productId: string
  product: Product
  licenseType: LicenseType
  quantity: number
  affiliateCode: string | null
  createdAt: string
}

export interface CartGroup {
  sellerId: string
  seller: SellerProfile
  items: CartItem[]
  subtotal: number
  feeCalculation: FeeCalculation | null
}

export interface Cart {
  items: CartItem[]
  groups: CartGroup[]
  subtotal: number
  totalBuyerFees: number
  total: number
  itemCount: number
}

// ─── ORDER ───────────────────────────────────────────────────

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  sellerId: string
  productId: string
  title: string
  price: number
  fee: number
  sellerReceives: number
  status: OrderStatus
  paymentMethod: PaymentMethod | null
  paymentId: string | null
  deliveryType: DeliveryType
  licenseType: LicenseType
  affiliateCode: string | null
  deliveredAt: string | null
  confirmedAt: string | null
  cancelledAt: string | null
  disputeReason: string | null
  createdAt: string
  updatedAt: string
  // Relacionamentos
  buyer?: UserProfile
  seller?: SellerProfile
  product?: Product
  delivery?: DeliveryRecord
  review?: Review
  statusHistory?: OrderStatusHistoryEntry[]
}

export interface OrderStatusHistoryEntry {
  id: string
  orderId: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedBy: string | null
  changedByRole: 'buyer' | 'seller' | 'system' | 'admin' | null
  reason: string | null
  createdAt: string
}

// ─── DELIVERY ────────────────────────────────────────────────

export interface DeliveryRecord {
  id: string
  orderId: string
  productId: string
  sellerId: string
  buyerId: string
  deliveryType: DeliveryType
  status: DeliveryStatus
  deliveryData: Record<string, unknown>
  deliveredAt: string | null
  confirmedAt: string | null
  createdAt: string
}

export interface DownloadToken {
  id: string
  orderId: string
  productId: string
  buyerId: string
  token: string
  resourceUrl: string
  maxDownloads: number
  downloadsCount: number
  expiresAt: string
  isActive: boolean
  createdAt: string
}

// ─── PAYMENT ─────────────────────────────────────────────────

export interface Payment {
  id: string
  orderId: string
  stripeSessionId: string | null
  stripePaymentIntentId: string | null
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod: string | null
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── REVIEW ──────────────────────────────────────────────────

export interface Review {
  id: string
  orderId: string
  reviewerId: string
  sellerId: string
  productId: string
  rating: number
  comment: string | null
  isAnonymous: boolean
  sellerResponse: string | null
  isVerified: boolean
  helpfulCount: number
  createdAt: string
  // Relacionamentos
  reviewer?: { username: string; avatarUrl: string | null }
}

// ─── AFFILIATE ───────────────────────────────────────────────

export interface Affiliate {
  id: string
  userId: string
  code: string
  commissionRate: number
  totalClicks: number
  totalConversions: number
  totalCommissions: number
  status: 'active' | 'suspended' | 'banned'
  createdAt: string
}

export interface AffiliateLink {
  id: string
  affiliateId: string
  productId: string
  code: string
  url: string
  clicks: number
  conversions: number
  isActive: boolean
}

// ─── REWARDS ─────────────────────────────────────────────────

export interface Achievement {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  category: 'general' | 'buyer' | 'seller' | 'affiliate' | 'social'
  conditionType: string
  conditionValue: Record<string, unknown>
  pointsReward: number
  unlockedAt?: string
}

export interface Mission {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  objectives: MissionObjective[]
  pointsReward: number
  status: 'in_progress' | 'completed' | 'claimed' | 'expired'
  progress: Record<string, number>
  endsAt: string | null
}

export interface MissionObjective {
  id: string
  description: string
  target: number
  current: number
  isComplete: boolean
}

// ─── WALLET & FINANCIAL ──────────────────────────────────────

export interface WalletBalance {
  available: number
  pending: number
  blocked: number
  total: number
}

export interface Transaction {
  id: string
  type: 'received' | 'withdrawal' | 'fee' | 'refund' | 'commission' | 'points' | 'adjustment'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  referenceType: string | null
  referenceId: string | null
  createdAt: string
}

export interface Withdrawal {
  id: string
  amount: number
  fee: number
  netAmount: number
  method: 'pix' | 'bank_transfer'
  pixKey: string | null
  pixKeyType: 'cpf' | 'email' | 'phone' | 'random' | null
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  processedAt: string | null
}

// ─── DISPUTE ─────────────────────────────────────────────────

export interface Dispute {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  reason: string
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  resolution: string | null
  resolvedBy: string | null
  evidenceUrls: string[]
  messages: DisputeMessage[]
  createdAt: string
  resolvedAt: string | null
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderId: string
  message: string
  attachmentUrl: string | null
  isSystem: boolean
  createdAt: string
}

// ─── NOTIFICATION ────────────────────────────────────────────

export interface Notification {
  id: string
  userId: string
  type: 'order' | 'message' | 'review' | 'withdrawal' | 'verification' | 'system' | 'promotion' | 'achievement' | 'affiliate' | 'dispute'
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

// ─── COUPON ──────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderValue: number
  maxUses: number | null
  usedCount: number
  validFrom: string
  validUntil: string | null
  isActive: boolean
  applicableCategories: string[]
  applicableProducts: string[]
  sellerId: string | null // null = cupom global
}

// ─── BUNDLE & FLASH SALE ─────────────────────────────────────

export interface Bundle {
  id: string
  sellerId: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  bundlePrice: number
  originalPrice: number | null
  products: Product[]
  isActive: boolean
}

export interface FlashSale {
  id: string
  productId: string
  originalPrice: number
  salePrice: number
  startsAt: string
  endsAt: string
  maxUnits: number | null
  soldCount: number
  isActive: boolean
  product?: Product
}

// ─── SUBSCRIPTION ────────────────────────────────────────────

export interface Subscription {
  id: string
  userId: string
  plan: string
  status: 'active' | 'past_due' | 'cancelled' | 'paused' | 'expired'
  stripeSubscriptionId: string | null
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
}

// ─── BLOG ────────────────────────────────────────────────────

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  imageUrl: string
  author: string
  authorAvatar: string
  readTime: string
  category: string
  tags: string[]
  isPublished: boolean
  createdAt: string
}

// ─── API RESPONSES ───────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  error: string
  code?: string
  details?: Record<string, string[]>
}

// ─── SEARCH ──────────────────────────────────────────────────

export interface SearchResult {
  products: Product[]
  categories: Category[]
  sellers: SellerProfile[]
  totalProducts: number
  query: string
  facets: SearchFacets
}

export interface SearchFacets {
  categories: { name: string; slug: string; count: number }[]
  priceRanges: { min: number; max: number; count: number }[]
  productTypes: { type: ProductType; count: number }[]
  ratings: { rating: number; count: number }[]
}

// ─── ADMIN ───────────────────────────────────────────────────

export interface AdminDashboardStats {
  gmv: number
  mrr: number
  arr: number
  totalRevenue: number
  totalOrders: number
  totalBuyers: number
  totalSellers: number
  totalAffiliates: number
  averageTicket: number
  conversionRate: number
  takeRate: number
  refundRate: number
  chargebackRate: number
  fraudRate: number
  cac: number
  ltv: number
  churn: number
}

export interface FeatureFlag {
  id: string
  name: string
  description: string | null
  isEnabled: boolean
  rolloutPercent: number
  allowedPlans: string[]
}
