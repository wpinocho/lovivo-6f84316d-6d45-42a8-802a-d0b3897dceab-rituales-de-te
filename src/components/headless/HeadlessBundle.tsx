import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, type Bundle, type Product, type ProductVariant } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'
import { useCart } from '@/contexts/CartContext'
import { useCartUI } from '@/components/CartProvider'
import { useSettings } from '@/contexts/SettingsContext'
import { useBundlePickerProducts, type PickerProduct } from '@/hooks/useBundlePickerProducts'
import { useBundleItems } from '@/hooks/useBundles'

export interface BundleLogic {
  bundle: Bundle | null
  loading: boolean
  notFound: boolean
  products: PickerProduct[]
  productsLoading: boolean
  // For mix_match selection
  selected: Map<string, { product: Product; variant?: ProductVariant }>
  pickQty: number
  isReady: boolean
  originalPrice: number
  toggleProduct: (productId: string, product: Product, matchingVariantId?: string) => void
  handleConfirmMixMatch: () => void
  // For fixed bundles
  fixedItems: any[]
  handleAddFixed: () => void
  // For collection_fixed - individual add
  handleAddProduct: (product: Product, variant?: ProductVariant) => void
  // Navigation
  handleNavigateBack: () => void
  formatMoney: (amount: number) => string
}

interface HeadlessBundleProps {
  children: (logic: BundleLogic) => React.ReactNode
}

export const HeadlessBundle = ({ children }: HeadlessBundleProps) => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { addItem, addBundle } = useCart()
  const { openCart } = useCartUI()
  const { formatMoney } = useSettings()

  useEffect(() => {
    if (!slug) return
    const fetchBundle = async () => {
      try {
        const { data, error } = await supabase
          .from('bundles')
          .select('id, title, description, images, slug, bundle_price, discount_percentage, compare_at_price, status, bundle_type, source_collection_id, pick_quantity, variant_filter')
          .eq('slug', slug)
          .eq('store_id', STORE_ID)
          .eq('status', 'active')
          .single()

        if (error || !data) {
          setNotFound(true)
          return
        }
        setBundle(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBundle()
  }, [slug])

  const isMixMatch = bundle?.bundle_type === 'mix_match' || bundle?.bundle_type === 'mix_match_variant'
  const isCollectionFixed = bundle?.bundle_type === 'collection_fixed'
  const isFixed = !isMixMatch && !isCollectionFixed

  // Load eligible products for mix_match and collection_fixed
  const { products, loading: productsLoading } = useBundlePickerProducts(
    (isMixMatch || isCollectionFixed) ? bundle?.source_collection_id : undefined,
    (isMixMatch || isCollectionFixed) ? bundle?.variant_filter : undefined
  )

  // Load fixed bundle items
  const { items: fixedItems } = useBundleItems(isFixed && bundle ? bundle.id : null)

  // Mix & match selection state
  const [selected, setSelected] = useState<Map<string, { product: Product; variant?: ProductVariant }>>(new Map())
  const pickQty = bundle?.pick_quantity || 2
  const isReady = selected.size === pickQty

  let originalPrice = 0
  selected.forEach(({ product, variant }) => {
    originalPrice += variant?.price ?? product.price
  })

  const toggleProduct = (productId: string, product: Product, matchingVariantId?: string) => {
    setSelected(prev => {
      const next = new Map(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else if (next.size < pickQty) {
        const variant = matchingVariantId
          ? product.variants?.find(v => v.id === matchingVariantId)
          : undefined
        next.set(productId, { product, variant })
      }
      return next
    })
  }

  const handleConfirmMixMatch = () => {
    if (!bundle) return
    const bundleItems = Array.from(selected.values()).map(({ product, variant }) => ({
      product,
      variant,
      quantity: 1,
    }))
    addBundle(bundle, bundleItems)
    setSelected(new Map())
    setTimeout(() => openCart(), 300)
  }

  const handleAddFixed = () => {
    if (!bundle || fixedItems.length === 0) return
    const bundleItems = fixedItems
      .filter(item => item.products)
      .map(item => {
        const variant = item.variant_id
          ? item.products!.variants?.find((v: any) => v.id === item.variant_id)
          : undefined
        return { product: item.products!, variant, quantity: item.quantity }
      })
    addBundle(bundle, bundleItems)
    setTimeout(() => openCart(), 300)
  }

  const handleAddProduct = (product: Product, variant?: ProductVariant) => {
    addItem(product, variant)
    setTimeout(() => openCart(), 300)
  }

  const logic: BundleLogic = {
    bundle,
    loading,
    notFound,
    products,
    productsLoading,
    selected,
    pickQty,
    isReady,
    originalPrice,
    toggleProduct,
    handleConfirmMixMatch,
    fixedItems,
    handleAddFixed,
    handleAddProduct,
    handleNavigateBack: () => navigate(-1),
    formatMoney,
  }

  return <>{children(logic)}</>
}
