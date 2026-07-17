// ─────────────────────────────────────────────────────────────
// Domain Layer — Exports centralizados
// Toda lógica de negócio vive aqui
// ─────────────────────────────────────────────────────────────

// Fee Engine — Motor de Taxas
export { FeeEngine, feeEngine, formatBRL, calculatePDPoints, validateMinimumPrice } from './fees/FeeEngine'
export type {
  ProductType, LicenseType, SellerPlan, SellerLevel, PaymentMethod,
  RiskCategory, FeeRule, FeeCondition, FeeTier, FeeCalculation,
  FeeBreakdownItem, FeeCalculationParams
} from './fees/FeeEngine'

// Ledger Engine — Contabilidade
export { LedgerEngine, ledgerEngine } from './ledger/LedgerEngine'
export type {
  LedgerAccountType, LedgerAccountName, LedgerEntry, LedgerTransaction,
  BalanceSnapshot, Settlement
} from './ledger/LedgerEngine'

// Order State Machine
export { OrderStateMachine, orderStateMachine } from './orders/OrderStateMachine'
export type {
  OrderStatus, StatusTransition, TransitionResult, OrderStatusHistory
} from './orders/OrderStateMachine'

// Delivery Engine
export { DeliveryEngine, deliveryEngine } from './delivery/DeliveryEngine'
export type {
  DeliveryType, DeliveryStatus, DownloadToken, DeliveryRecord,
  DeliveryData, ServiceMilestone, DeliveryAttempt, DeliveryResult
} from './delivery/DeliveryEngine'

// Cart Store
export { useCartStore } from './cart/CartStore'
export type { CartItemData, CartSellerGroup } from './cart/CartStore'

// Vault Engine — O Cofre Digital
export { VaultEngine, vaultEngine } from './vault/VaultEngine'
export type {
  VaultAsset, DeliveredAsset, VaultUploadInput,
  BulkUploadResult, VaultStats, AssetType, AssetStatus
} from './vault/VaultEngine'
