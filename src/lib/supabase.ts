import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptgmltivisbtvmoxwnhd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0Z21sdGl2aXNidHZtb3h3bmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNzA2MzUsImV4cCI6MjA2Nzg0NjYzNX0.uU-Zh7AthPiJKmw1_oUnh8tLmCpmt0-M-y5Kd8_Fc34'

export const supabase = createClient(supabaseUrl, supabaseKey)
export { supabaseUrl, supabaseKey }

export type ProductOption = {
  id: string
  name: string
  values: string[]
  swatches?: Record<string, string>
}

export type ProductVariant = {
  id: string
  sku?: string
  title?: string
  option_values?: Record<string, string>
  price?: number
  compare_at_price?: number
  inventory_quantity?: number
  available?: boolean
  image?: string
  image_urls?: string[]
  created_at?: string
}

export type ImageMetadata = {
  url?: string
  size_bytes?: number
  content_type?: string
  width?: number
  height?: number
  optimized?: boolean
}

export type Product = {
  id: string
  title: string
  slug: string
  price: number
  compare_at_price?: number
  description?: string
  images?: string[]
  image_metadata?: ImageMetadata[]
  status?: string
  featured?: boolean
  store_id?: string
  created_at?: string
  inventory_quantity?: number
  track_inventory?: boolean
  options?: ProductOption[]
  variants?: ProductVariant[]
}

export type Collection = {
  id: string
  name: string
  description?: string
  image?: string
  image_metadata?: ImageMetadata
  status?: string
  store_id?: string
  featured?: boolean
  created_at?: string
}

export type CollectionProduct = {
  collection_id: string
  product_id: string
}

export type Blog = {
  id: string
  title: string
  slug: string
  content?: string
  excerpt?: string
  featured_image?: string[]
  status?: string
  store_id?: string
  created_at?: string
  updated_at?: string
}

// Checkout types
export interface CheckoutItem {
  product_id: string
  quantity: number
  variant_id?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  total: number
  store_id: string
  created_at: string
  variant_id?: string
}

export interface AppliedRule {
  rule_id: string
  title: string
  rule_type: 'volume' | 'bogo' | 'free_shipping' | 'bundle'
  discount: number
}

export interface Order {
  id: string
  store_id: string
  customer_id?: string
  order_number: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  shipping_address?: any
  billing_address?: any
  notes?: string
  discount_code?: string | null
  applied_rules?: AppliedRule[] | null
  currency_code: string
  status: string
  checkout_token: string
  created_at: string
  updated_at: string
  order_items: OrderItem[]
  customers?: {
    email: string
    first_name?: string
    last_name?: string
  }
}

export interface CheckoutPayload {
  store_id: string
  items: CheckoutItem[]
  user_id?: string
  discount_code?: string
  customer?: {
    email: string
    first_name?: string
    last_name?: string
    phone?: string
  }
  shipping_address?: any
  billing_address?: any
  notes?: string
  currency_code?: string
}

export interface CheckoutResponse {
  order_id: string
  checkout_token: string
  order_number: string
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total_amount: number
  currency_code: string
  status: string
  order: Order
  unavailable_items?: any[]
}

export type Bundle = {
  id: string
  title: string
  description?: string
  images?: string[]
  slug?: string
  bundle_price?: number | null
  discount_percentage?: number
  compare_at_price?: number
  status?: string
  store_id?: string
  created_at?: string
  bundle_type?: 'fixed' | 'collection_fixed' | 'mix_match' | 'mix_match_variant'
  source_collection_id?: string
  pick_quantity?: number
  variant_filter?: { option_name?: string; option_value?: string; option_values?: string[] }
}

export type BundleItem = {
  id: string
  bundle_id: string
  product_id: string
  variant_id?: string
  quantity: number
  sort_order?: number
  products?: Product
}

// Price Rule condition types
export type FreeShippingConditions = {
  min_subtotal?: number | null
  min_quantity?: number | null
}

export type VolumeTier = {
  min_quantity: number
  discount_value: number
}

export type VolumeConditions = {
  discount_type: 'percentage' | 'fixed'
  tier_mode: 'flat' | 'graduated'
  tiers: VolumeTier[]
}

export type BogoConditions = {
  buy_quantity: number
  get_quantity: number
  get_discount_percentage: number
  bogo_mode: 'same_product' | 'different_products'
}

export type PriceRuleConditions = FreeShippingConditions | VolumeConditions | BogoConditions | Record<string, any>

export type PriceRule = {
  id: string
  title: string
  description?: string
  rule_type: 'volume' | 'bogo' | 'free_shipping' | 'bundle'
  conditions?: PriceRuleConditions
  applies_to?: string
  product_ids?: string[]
  collection_ids?: string[]
  active?: boolean
  starts_at?: string | null
  ends_at?: string | null
  store_id?: string
  priority?: number
}

export type StoreSettings = {
  id: string
  store_id: string
  currency_code: string
  social_links?: any
  logos?: any
  store_language?: string
  date_format?: string
  shipping_coverage?: any
  pickup_locations?: any
  delivery_expectations?: any
  meta_pixel_id?: string
  updated_at?: string
}