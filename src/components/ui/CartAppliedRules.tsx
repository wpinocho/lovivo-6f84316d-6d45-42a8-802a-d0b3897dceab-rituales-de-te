import { Tag, Truck, Percent, Package } from 'lucide-react'
import type { AppliedRule } from '@/lib/supabase'

interface CartAppliedRulesProps {
  appliedRules: AppliedRule[]
  formatMoney: (value: number) => string
}

const ruleIcons: Record<string, React.ElementType> = {
  volume: Percent,
  bogo: Tag,
  free_shipping: Truck,
  bundle: Package,
}

const ruleLabels: Record<string, string> = {
  volume: 'Desc. por volumen',
  bogo: 'Promoción',
  free_shipping: 'Envío gratis',
  bundle: 'Paquete',
}

export const CartAppliedRules = ({ appliedRules, formatMoney }: CartAppliedRulesProps) => {
  if (!appliedRules || appliedRules.length === 0) return null

  return (
    <div className="space-y-1.5">
      {appliedRules.map((rule, index) => {
        const Icon = ruleIcons[rule.rule_type] || Tag
        const fallbackLabel = ruleLabels[rule.rule_type] || ''

        return (
          <div key={rule.rule_id || index} className="flex justify-between text-sm text-foreground">
            <span className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{rule.title || fallbackLabel}</span>
            </span>
            {rule.discount > 0 && (
              <span className="text-foreground font-medium">- {formatMoney(rule.discount)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
