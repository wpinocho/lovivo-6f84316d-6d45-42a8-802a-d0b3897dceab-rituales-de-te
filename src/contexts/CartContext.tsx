import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import type { Product, ProductVariant, Bundle } from '@/lib/supabase'

// --- Cart Item Types (Union) ---

export interface CartProductItem {
  type: 'product'
  key: string
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface BundleItemEntry {
  product: Product
  variant?: ProductVariant
  quantity: number
}

export interface CartBundleItem {
  type: 'bundle'
  key: string
  bundle: Bundle
  bundleItems: BundleItemEntry[]
  quantity: number
}

export type CartItem = CartProductItem | CartBundleItem

// Legacy compat: old items without type are treated as product
const normalizeItem = (item: any): CartItem => {
  if (item.type === 'bundle') return item as CartBundleItem
  return { ...item, type: 'product' } as CartProductItem
}

// --- Helpers ---

const getItemPrice = (item: CartItem): number => {
  if (item.type === 'bundle') return item.bundle.bundle_price * item.quantity
  return ((item.variant?.price ?? item.product.price) || 0) * item.quantity
}

const calcTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + getItemPrice(item), 0)

// --- State & Actions ---

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; variant?: ProductVariant } }
  | { type: 'ADD_BUNDLE'; payload: { bundle: Bundle; bundleItems: BundleItemEntry[] } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { key: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartState }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variant } = action.payload
      const key = `${product.id}${variant ? `:${variant.id}` : ''}`
      const existingItem = state.items.find(item => item.key === key)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        newItems = [...state.items, { type: 'product' as const, key, product, variant, quantity: 1 }]
      }
      return { items: newItems, total: calcTotal(newItems) }
    }

    case 'ADD_BUNDLE': {
      const { bundle, bundleItems } = action.payload
      const key = `bundle:${bundle.id}`
      const existingItem = state.items.find(item => item.key === key)

      let newItems: CartItem[]
      if (existingItem) {
        newItems = state.items.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        newItems = [...state.items, { type: 'bundle' as const, key, bundle, bundleItems, quantity: 1 }]
      }
      return { items: newItems, total: calcTotal(newItems) }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.key !== action.payload)
      return { items: newItems, total: calcTotal(newItems) }
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.key })
      }
      const newItems = state.items.map(item =>
        item.key === action.payload.key ? { ...item, quantity: action.payload.quantity } : item
      )
      return { items: newItems, total: calcTotal(newItems) }
    }

    case 'CLEAR_CART':
      return { items: [], total: 0 }

    case 'SET_CART':
      return action.payload

    default:
      return state
  }
}

// --- Context ---

interface CartContextType {
  state: CartState
  addItem: (product: Product, variant?: ProductVariant) => void
  addBundle: (bundle: Bundle, bundleItems: BundleItemEntry[]) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'cart-state'

const initializeCartFromStorage = (): CartState => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Normalize legacy items
      const items = (parsed.items || []).map(normalizeItem)
      return { items, total: calcTotal(items) }
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error)
  }
  return { items: [], total: 0 }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initializeCartFromStorage())

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [state])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          const items = (parsed.items || []).map(normalizeItem)
          dispatch({ type: 'SET_CART', payload: { items, total: calcTotal(items) } })
        } catch (error) {
          console.error('Error parsing cart from storage event:', error)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const addItem = (product: Product, variant?: ProductVariant) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variant } })
  }

  const addBundle = (bundle: Bundle, bundleItems: BundleItemEntry[]) => {
    dispatch({ type: 'ADD_BUNDLE', payload: { bundle, bundleItems } })
  }

  const removeItem = (key: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: key })
  }

  const updateQuantity = (key: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error)
    }
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{ state, addItem, addBundle, removeItem, updateQuantity, clearCart, getTotalItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
