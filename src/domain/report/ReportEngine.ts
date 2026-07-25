// ─────────────────────────────────────────────────────────────
// Report Engine v0.0.1 — Relatórios e análises financeiras
// Vendas, taxas, saques, comissões, DRE
// ─────────────────────────────────────────────────────────────

export interface SalesReport {
  period: { start: string; end: string }
  summary: {
    totalSales: number
    totalRevenue: number
    totalFees: number
    totalPayouts: number
    totalRefunds: number
    netRevenue: number
    averageTicket: number
    conversionRate: number
  }
  byDay: Array<{
    date: string
    sales: number
    revenue: number
    orders: number
  }>
  byProduct: Array<{
    productId: string
    productName: string
    sales: number
    revenue: number
    category: string
  }>
  byPaymentMethod: Record<string, { count: number; total: number }>
  topSellers: Array<{
    sellerId: string
    sellerName: string
    sales: number
    revenue: number
  }>
}

export interface FinancialDRE {
  revenue: {
    grossSales: number
    sellerFees: number
    buyerFees: number
    boostRevenue: number
    affiliateRevenue: number
    subscriptionRevenue: number
    totalRevenue: number
  }
  costs: {
    paymentProcessing: number
    refunds: number
    chargebacks: number
    kdPointsCost: number
    marketingCost: number
    infraCost: number
    totalCosts: number
  }
  profit: {
    grossProfit: number
    netProfit: number
    margin: number
  }
}

export class ReportEngine {
  /**
   * Gera relatório de vendas
   */
  generateSalesReport(data: {
    orders: Array<{ id: string; total_amount: number; platform_fee: number; status: string; created_at: string }>
    products: Array<{ id: string; title: string; category: string; price: number }>
    startDate: string
    endDate: string
  }): SalesReport {
    const { orders, products, startDate, endDate } = data

    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'paid')
    const totalSales = completedOrders.length
    const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.total_amount), 0)
    const totalFees = completedOrders.reduce((s, o) => s + Number(o.platform_fee), 0)
    const refunds = orders.filter(o => o.status === 'refunded')
    const totalRefunds = refunds.reduce((s, o) => s + Number(o.total_amount), 0)

    // Agrupar por dia
    const byDayMap = new Map<string, { sales: number; revenue: number; orders: number }>()
    for (const order of completedOrders) {
      const day = order.created_at.split('T')[0]
      const entry = byDayMap.get(day) || { sales: 0, revenue: 0, orders: 0 }
      entry.sales++
      entry.revenue += Number(order.total_amount)
      entry.orders++
      byDayMap.set(day, entry)
    }

    // Agrupar por produto
    const byProductMap = new Map<string, { productId: string; productName: string; sales: number; revenue: number; category: string }>()

    // Payment methods
    const byPaymentMethod: Record<string, { count: number; total: number }> = {}

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalFees: Math.round(totalFees * 100) / 100,
        totalPayouts: Math.round((totalRevenue - totalFees) * 100) / 100,
        totalRefunds: Math.round(totalRefunds * 100) / 100,
        netRevenue: Math.round((totalRevenue - totalFees - totalRefunds) * 100) / 100,
        averageTicket: totalSales > 0 ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0,
        conversionRate: 0,
      },
      byDay: Array.from(byDayMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      byProduct: Array.from(byProductMap.values()),
      byPaymentMethod,
      topSellers: [],
    }
  }

  /**
   * Calcula DRE (Demonstração de Resultados)
   */
  calculateDRE(params: {
    grossSales: number
    sellerFees: number
    buyerFees: number
    boostRevenue: number
    affiliateRevenue: number
    subscriptionRevenue: number
    paymentProcessingRate: number
    refundRate: number
    chargebackRate: number
    kdPointsRate: number
  }): FinancialDRE {
    const totalRevenue = params.grossSales + params.boostRevenue + params.affiliateRevenue + params.subscriptionRevenue
    const paymentProcessing = params.grossSales * params.paymentProcessingRate
    const refunds = params.grossSales * params.refundRate
    const chargebacks = params.grossSales * params.chargebackRate
    const kdPointsCost = params.grossSales * params.kdPointsRate
    const totalCosts = paymentProcessing + refunds + chargebacks + kdPointsCost
    const grossProfit = totalRevenue - totalCosts

    return {
      revenue: {
        grossSales: Math.round(params.grossSales * 100) / 100,
        sellerFees: Math.round(params.sellerFees * 100) / 100,
        buyerFees: Math.round(params.buyerFees * 100) / 100,
        boostRevenue: Math.round(params.boostRevenue * 100) / 100,
        affiliateRevenue: Math.round(params.affiliateRevenue * 100) / 100,
        subscriptionRevenue: Math.round(params.subscriptionRevenue * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      costs: {
        paymentProcessing: Math.round(paymentProcessing * 100) / 100,
        refunds: Math.round(refunds * 100) / 100,
        chargebacks: Math.round(chargebacks * 100) / 100,
        kdPointsCost: Math.round(kdPointsCost * 100) / 100,
        marketingCost: 0,
        infraCost: 0,
        totalCosts: Math.round(totalCosts * 100) / 100,
      },
      profit: {
        grossProfit: Math.round(grossProfit * 100) / 100,
        netProfit: Math.round(grossProfit * 100) / 100,
        margin: totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0,
      },
    }
  }
}

export const reportEngine = new ReportEngine()
