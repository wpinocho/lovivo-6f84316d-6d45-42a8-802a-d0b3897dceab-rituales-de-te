import { usePriceRules } from '@/hooks/usePriceRules'
import type { VolumeConditions } from '@/lib/supabase'

interface VolumeBadgeProps {
  productId: string
  collectionIds?: string[]
}

export const VolumeBadge = ({ productId, collectionIds }: VolumeBadgeProps) => {
  const { getVolumeRulesForProduct } = usePriceRules()

  const rules = getVolumeRulesForProduct(productId, collectionIds)
  if (rules.length === 0) return null

  const rule = rules[0]
  const conditions = rule.conditions as VolumeConditions | undefined
  if (!conditions?.tiers?.length) return null

  // Show the first (most accessible) tier
  const firstTier = conditions.tiers[0]
  const suffix = conditions.discount_type === 'percentage' ? '%' : ''
  const label = `${firstTier.min_quantity}+ → ${firstTier.discount_value}${suffix} OFF`

  return (
    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
      {label}
    </span>
  )
}
