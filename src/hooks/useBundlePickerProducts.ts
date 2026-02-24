import { useEffect, useState } from 'react'
import { supabase, type Product } from '@/lib/supabase'

interface VariantFilter {
  option_name?: string
  option_value?: string
  option_values?: string[]
}

export interface PickerProduct {
  product: Product
  matchingVariantId?: string
}

export const useBundlePickerProducts = (
  sourceCollectionId: string | undefined,
  variantFilter?: VariantFilter | null
) => {
  const [products, setProducts] = useState<PickerProduct[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sourceCollectionId) return

    const fetch = async () => {
      setLoading(true)
      try {
        // Step 1: Get product IDs from collection
        const { data: cpData, error: cpError } = await supabase
          .from('collection_products')
          .select('product_id')
          .eq('collection_id', sourceCollectionId)

        if (cpError || !cpData?.length) {
          setProducts([])
          return
        }

        const productIds = cpData.map(cp => cp.product_id)

        // Step 2: Fetch those products
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select('id, title, slug, price, compare_at_price, images, image_metadata, status, variants, options')
          .in('id', productIds)
          .eq('status', 'active')

        if (prodError || !prodData) {
          setProducts([])
          return
        }

        // Step 3: Filter by variant if needed
        const hasNameValue = variantFilter?.option_name && variantFilter?.option_value
        const hasOptionValues = variantFilter?.option_values && variantFilter.option_values.length > 0

        if (hasNameValue || hasOptionValues) {
          const filtered: PickerProduct[] = []
          for (const product of prodData) {
            const matchingVariant = (product.variants || []).find((v: any) => {
              const ov = v.option_values || v.options || {}
              if (hasNameValue) {
                return ov[variantFilter!.option_name!] === variantFilter!.option_value
              }
              // option_values format: check if any option value matches
              const vals = variantFilter!.option_values!
              return Object.values(ov).some((v: any) => vals.includes(v))
            })
            if (matchingVariant) {
              filtered.push({ product, matchingVariantId: matchingVariant.id })
            }
          }
          setProducts(filtered)
        } else {
          setProducts(prodData.map(p => ({ product: p })))
        }
      } catch (error) {
        console.error('Error fetching bundle picker products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [sourceCollectionId, JSON.stringify(variantFilter)])

  return { products, loading }
}
