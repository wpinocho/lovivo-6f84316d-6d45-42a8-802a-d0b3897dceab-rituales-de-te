import { useEffect, useState } from 'react'
import { supabase, type PriceRule } from '@/lib/supabase'
import { STORE_ID } from '@/lib/config'

export const usePriceRules = () => {
  const [priceRules, setPriceRules] = useState<PriceRule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const { data, error } = await supabase
          .from('price_rules')
          .select('id, title, description, rule_type, conditions, applies_to, product_ids, collection_ids, starts_at, ends_at, priority')
          .eq('store_id', STORE_ID)
          // RLS already filters active + date range

        if (error) {
          console.error('Error fetching price rules:', error)
          return
        }

        setPriceRules(data || [])
      } catch (error) {
        console.error('Error fetching price rules:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRules()
  }, [])

  const getRulesForProduct = (productId: string, collectionIds?: string[]): PriceRule[] => {
    return priceRules.filter(rule => {
      if (rule.applies_to === 'all') return true
      if (rule.applies_to === 'specific_products' && rule.product_ids?.includes(productId)) return true
      if (rule.applies_to === 'specific_collections' && collectionIds && rule.collection_ids?.some(cid => collectionIds.includes(cid))) return true
      return false
    })
  }

  const getRulesByType = (type: PriceRule['rule_type']): PriceRule[] => {
    return priceRules.filter(rule => rule.rule_type === type)
  }

  const getFreeShippingRules = (): PriceRule[] => getRulesByType('free_shipping')

  const getVolumeRulesForProduct = (productId: string, collectionIds?: string[]): PriceRule[] => {
    return getRulesForProduct(productId, collectionIds).filter(r => r.rule_type === 'volume')
  }

  const getBogoRulesForProduct = (productId: string, collectionIds?: string[]): PriceRule[] => {
    return getRulesForProduct(productId, collectionIds).filter(r => r.rule_type === 'bogo')
  }

  return { priceRules, loading, getRulesForProduct, getRulesByType, getFreeShippingRules, getVolumeRulesForProduct, getBogoRulesForProduct }
}
