import type { CartItem } from '@/contexts/CartContext'
import type { CheckoutItem } from '@/lib/supabase'

/**
 * Decomposes cart items (including bundles) into flat API items
 * for checkout-create / checkout-update.
 * Merges duplicates by product_id + variant_id.
 */
export function cartToApiItems(cartItems: CartItem[]): CheckoutItem[] {
  const map = new Map<string, CheckoutItem>()

  for (const item of cartItems) {
    if (item.type === 'bundle') {
      for (const bi of item.bundleItems) {
        const key = `${bi.product.id}:${bi.variant?.id || ''}`
        const qty = bi.quantity * item.quantity
        const existing = map.get(key)
        if (existing) {
          existing.quantity += qty
        } else {
          map.set(key, {
            product_id: bi.product.id,
            quantity: qty,
            ...(bi.variant && { variant_id: bi.variant.id }),
          })
        }
      }
    } else {
      // type === 'product' (or legacy without type)
      const product = (item as any).product
      const variant = (item as any).variant
      const key = `${product.id}:${variant?.id || ''}`
      const existing = map.get(key)
      if (existing) {
        existing.quantity += item.quantity
      } else {
        map.set(key, {
          product_id: product.id,
          quantity: item.quantity,
          ...(variant && { variant_id: variant.id }),
        })
      }
    }
  }

  return Array.from(map.values())
}
