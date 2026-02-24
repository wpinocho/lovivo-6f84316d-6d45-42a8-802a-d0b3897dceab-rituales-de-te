import { usePriceRules } from '@/hooks/usePriceRules'
import { useSettings } from '@/contexts/SettingsContext'
import { Truck } from 'lucide-react'
import type { FreeShippingConditions } from '@/lib/supabase'

interface FreeShippingBarProps {
  cartTotal: number
  cartQuantity: number
}

export const FreeShippingBar = ({ cartTotal, cartQuantity }: FreeShippingBarProps) => {
  const { getFreeShippingRules } = usePriceRules()
  const { formatMoney } = useSettings()

  const rules = getFreeShippingRules()
  if (rules.length === 0) return null

  // Use highest priority rule
  const rule = rules[0]
  const conditions = rule.conditions as FreeShippingConditions | undefined

  const minSubtotal = conditions?.min_subtotal
  const minQuantity = conditions?.min_quantity

  // No conditions = always free shipping
  if (!minSubtotal && !minQuantity) {
    return (
      <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-lg px-4 py-2.5 text-sm font-medium">
        <Truck className="h-4 w-4 shrink-0" />
        <span>Envío gratis en todos los pedidos</span>
      </div>
    )
  }

  // Check subtotal threshold
  if (minSubtotal) {
    const remaining = minSubtotal - cartTotal
    const progress = Math.min((cartTotal / minSubtotal) * 100, 100)
    const achieved = remaining <= 0

    return (
      <div className="bg-secondary rounded-lg px-4 py-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Truck className="h-4 w-4 shrink-0 text-foreground" />
          {achieved ? (
            <span className="text-foreground">Envío gratis aplicado</span>
          ) : (
            <span className="text-foreground">
              Agrega {formatMoney(remaining)} más para envío gratis
            </span>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  // Check quantity threshold
  if (minQuantity) {
    const remaining = minQuantity - cartQuantity
    const achieved = remaining <= 0

    return (
      <div className="flex items-center gap-2 bg-secondary text-foreground rounded-lg px-4 py-2.5 text-sm font-medium">
        <Truck className="h-4 w-4 shrink-0" />
        {achieved ? (
          <span>Envío gratis aplicado</span>
        ) : (
          <span>Agrega {remaining} producto{remaining > 1 ? 's' : ''} más para envío gratis</span>
        )}
      </div>
    )
  }

  return null
}
