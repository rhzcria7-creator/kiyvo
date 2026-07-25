// ─────────────────────────────────────────────────────────────
// Localization Engine v0.0.1 — Internacionalização e moedas
// PT-BR, EN, ES, currency BRL/USD/EUR, formatação regional
// ─────────────────────────────────────────────────────────────

export type Locale = 'pt-BR' | 'en-US' | 'es-ES'
export type Currency = 'BRL' | 'USD' | 'EUR'

export interface LocaleConfig {
  locale: Locale
  name: string
  nativeName: string
  currency: Currency
  currencySymbol: string
  decimalSeparator: string
  thousandsSeparator: string
  dateFormat: string
  timeFormat: string
  taxRate: number
}

const LOCALES: Record<Locale, LocaleConfig> = {
  'pt-BR': {
    locale: 'pt-BR', name: 'Português (Brasil)', nativeName: 'Português (Brasil)',
    currency: 'BRL', currencySymbol: 'R$', decimalSeparator: ',', thousandsSeparator: '.',
    dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm',
    taxRate: 0,
  },
  'en-US': {
    locale: 'en-US', name: 'English (US)', nativeName: 'English (US)',
    currency: 'USD', currencySymbol: '$', decimalSeparator: '.', thousandsSeparator: ',',
    dateFormat: 'MM/DD/YYYY', timeFormat: 'hh:mm A',
    taxRate: 0,
  },
  'es-ES': {
    locale: 'es-ES', name: 'Español', nativeName: 'Español',
    currency: 'EUR', currencySymbol: '€', decimalSeparator: ',', thousandsSeparator: '.',
    dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm',
    taxRate: 0.21,
  },
}

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  'pt-BR': {
    'cart': 'Carrinho',
    'checkout': 'Finalizar Compra',
    'search': 'Buscar',
    'products': 'Produtos',
    'categories': 'Categorias',
    'account': 'Conta',
    'orders': 'Pedidos',
    'library': 'Biblioteca',
    'favorites': 'Favoritos',
    'settings': 'Configurações',
    'help': 'Ajuda',
    'sell': 'Vender',
    'trending': 'Em Alta',
    'daily_deals': 'Ofertas do Dia',
    'flash_sale': 'Oferta Relâmpago',
    'kd_points': 'KD Points',
    'withdraw': 'Sacar',
    'boost': 'Impulsionar',
  },
  'en-US': {
    'cart': 'Cart',
    'checkout': 'Checkout',
    'search': 'Search',
    'products': 'Products',
    'categories': 'Categories',
    'account': 'Account',
    'orders': 'Orders',
    'library': 'Library',
    'favorites': 'Favorites',
    'settings': 'Settings',
    'help': 'Help',
    'sell': 'Sell',
    'trending': 'Trending',
    'daily_deals': 'Daily Deals',
    'flash_sale': 'Flash Sale',
    'kd_points': 'KD Points',
    'withdraw': 'Withdraw',
    'boost': 'Boost',
  },
  'es-ES': {
    'cart': 'Carrito',
    'checkout': 'Pagar',
    'search': 'Buscar',
    'products': 'Productos',
    'categories': 'Categorías',
    'account': 'Cuenta',
    'orders': 'Pedidos',
    'library': 'Biblioteca',
    'favorites': 'Favoritos',
    'settings': 'Configuración',
    'help': 'Ayuda',
    'sell': 'Vender',
    'trending': 'Tendencias',
    'daily_deals': 'Ofertas del Día',
    'flash_sale': 'Oferta Relámpago',
    'kd_points': 'KD Points',
    'withdraw': 'Retirar',
    'boost': 'Impulsar',
  },
}

export class LocalizationEngine {
  private currentLocale: Locale = 'pt-BR'

  setLocale(locale: Locale): void { this.currentLocale = locale }
  getLocale(): LocaleConfig { return LOCALES[this.currentLocale] }
  getLocales(): LocaleConfig[] { return Object.values(LOCALES) }

  t(key: string, locale?: Locale): string {
    const loc = locale || this.currentLocale
    return TRANSLATIONS[loc]?.[key] || TRANSLATIONS['pt-BR']?.[key] || key
  }

  formatCurrency(value: number, locale?: Locale): string {
    const loc = LOCALES[locale || this.currentLocale]
    const formatted = Math.abs(value).toFixed(2)
      .replace('.', loc.decimalSeparator)
      .replace(/\B(?=(\d{3})+(?!\d))/g, loc.thousandsSeparator)
    const symbol = loc.currencySymbol
    return value < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`
  }

  formatDate(date: string | Date, locale?: Locale): string {
    const loc = LOCALES[locale || this.currentLocale]
    const d = typeof date === 'string' ? new Date(date) : date
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    switch (loc.dateFormat) {
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`
      default: return `${day}/${month}/${year}`
    }
  }

  formatNumber(value: number, decimals = 0, locale?: Locale): string {
    const loc = LOCALES[locale || this.currentLocale]
    return value.toFixed(decimals)
      .replace('.', loc.decimalSeparator)
      .replace(/\B(?=(\d{3})+(?!\d))/g, loc.thousandsSeparator)
  }

  getCurrencySymbol(currency?: Currency): string {
    const map: Record<Currency, string> = { BRL: 'R$', USD: '$', EUR: '€' }
    if (currency) return map[currency]
    return map[LOCALES[this.currentLocale].currency]
  }

  getLocaleFromHeader(acceptLanguage?: string): Locale {
    if (!acceptLanguage) return 'pt-BR'
    if (acceptLanguage.includes('pt')) return 'pt-BR'
    if (acceptLanguage.includes('es')) return 'es-ES'
    if (acceptLanguage.includes('en')) return 'en-US'
    return 'pt-BR'
  }
}

export const localizationEngine = new LocalizationEngine()
