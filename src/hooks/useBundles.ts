import { useEffect, useState } from 'react'
import { supabase, type Bundle, type BundleItem } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'

export const useBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const { data, error } = await supabase
          .from('bundles')
          .select('id, title, description, images, slug, bundle_price, discount_percentage, compare_at_price, status, bundle_type, source_collection_id, pick_quantity, variant_filter')
          .eq('store_id', STORE_ID)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching bundles:', error)
          return
        }

        setBundles(data || [])
      } catch (error) {
        console.error('Error fetching bundles:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBundles()
  }, [])

  return { bundles, loading }
}

export const useBundleItems = (bundleId: string | null) => {
  const [items, setItems] = useState<BundleItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!bundleId) return

    const fetchItems = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('bundle_items')
          .select('id, bundle_id, product_id, variant_id, quantity, sort_order, products (id, title, price, images, variants, status)')
          .eq('bundle_id', bundleId)
          .order('sort_order')

        if (error) {
          console.error('Error fetching bundle items:', error)
          return
        }

        setItems((data as any) || [])
      } catch (error) {
        console.error('Error fetching bundle items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [bundleId])

  return { items, loading }
}
