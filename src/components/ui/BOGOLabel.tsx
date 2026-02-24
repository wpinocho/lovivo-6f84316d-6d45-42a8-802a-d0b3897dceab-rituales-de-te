import { usePriceRules } from '@/hooks/usePriceRules'
import type { BogoConditions } from '@/lib/supabase'

interface BOGOLabelProps {
  productId: string
  collectionIds?: string[]
}

export const BOGOLabel = ({ productId, collectionIds }: BOGOLabelProps) => {
  const { getBogoRulesForProduct } = usePriceRules()

  const rules = getBogoRulesForProduct(productId, collectionIds)
  if (rules.length === 0) return null

  const rule = rules[0]
  const conditions = rule.conditions as BogoConditions | undefined
  if (!conditions) return null

  const { buy_quantity, get_quantity, get_discount_percentage } = conditions

  let label: string
  if (get_discount_percentage === 100) {
    label = `Lleva ${buy_quantity + get_quantity}, paga ${buy_quantity}`
  } else {
    label = `Compra ${buy_quantity}, lleva ${get_quantity} al ${get_discount_percentage}%`
  }

  return (
    <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded font-medium">
      {label}
    </span>
  )
}
