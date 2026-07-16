export interface Product {
  id: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  image: string
  category: string
  categorySlug: string
  seller: Seller
  type: 'account' | 'key' | 'item' | 'gold' | 'service' | 'giftcard' | 'license' | 'ebook' | 'course' | 'template' | 'subscription' | 'domain' | 'api' | 'streaming' | 'crypto' | 'nft'
  deliveryType: 'auto' | 'manual'
  featured: boolean
  sales: number
  rating: number
  reviews: number
  description: string
  tags: string[]
  createdAt: string
}

export interface Seller {
  id: string
  name: string
  avatar: string
  sales: number
  rating: number
  verified: boolean
  memberSince: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  productCount: number
  featured: boolean
  icon?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  image: string
  author: string
  authorAvatar: string
  readTime: string
  createdAt: string
  category: string
}

export interface Review {
  id: string
  user: string
  avatar: string
  rating: number
  comment: string
  product: string
  createdAt: string
}

export interface Order {
  id: string
  product: string
  seller: string
  price: number
  status: 'pending' | 'delivered' | 'cancelled' | 'in_dispute'
  date: string
}

export interface Listing {
  id: string
  title: string
  price: number
  plan: 'silver' | 'gold' | 'diamond'
  status: 'active' | 'paused' | 'expired'
  views: number
  sales: number
  createdAt: string
}

export interface Withdrawal {
  id: string
  amount: number
  method: 'pix'
  status: 'pending' | 'completed' | 'failed'
  date: string
}

export interface Plan {
  id: 'silver' | 'gold' | 'diamond'
  name: string
  fee: number
  features: string[]
  price: string
  popular?: boolean
}

export interface FAQ {
  id: string
  category: string
  question: string
  answer: string
}
