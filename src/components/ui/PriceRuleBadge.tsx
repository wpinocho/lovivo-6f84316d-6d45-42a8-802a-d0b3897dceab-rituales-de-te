import type { PriceRule, VolumeConditions, BogoConditions } from '@/lib/supabase'

interface PriceRuleBadgeProps {
  rule: PriceRule
}

export const PriceRuleBadge = ({ rule }: PriceRuleBadgeProps) => {
  const label = getRuleLabel(rule)
  if (!label) return null

  return (
    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
      {label}
    </span>
  )
}

function getRuleLabel(rule: PriceRule): string | null {
  const conditions = rule.conditions as any

  switch (rule.rule_type) {
    case 'volume': {
      const vol = conditions as VolumeConditions | undefined
      if (vol?.tiers?.length) {
        const t = vol.tiers[0]
        const suffix = vol.discount_type === 'percentage' ? '%' : ''
        return `${t.min_quantity}+ → ${t.discount_value}${suffix} OFF`
      }
      return rule.title || 'Desc. por volumen'
    }
    case 'bogo': {
      const bogo = conditions as BogoConditions | undefined
      if (bogo?.buy_quantity && bogo?.get_quantity) {
        if (bogo.get_discount_percentage === 100) {
          return `Lleva ${bogo.buy_quantity + bogo.get_quantity}, paga ${bogo.buy_quantity}`
        }
        return `Compra ${bogo.buy_quantity}, lleva ${bogo.get_quantity} al ${bogo.get_discount_percentage}%`
      }
      return rule.title || '2x1'
    }
    case 'free_shipping':
      return rule.title || 'Envío gratis'
    case 'bundle':
      return rule.title || 'Paquete'
    default:
      return rule.title || null
  }
}
