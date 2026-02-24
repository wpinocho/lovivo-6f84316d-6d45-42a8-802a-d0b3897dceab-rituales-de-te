import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package } from 'lucide-react'
import type { Bundle } from '@/lib/supabase'
import { useSettings } from '@/contexts/SettingsContext'
import { useCart } from '@/contexts/CartContext'
import { useCartUI } from '@/components/CartProvider'
import { useBundleItems } from '@/hooks/useBundles'
import { BundlePicker } from '@/components/ui/BundlePicker'

interface BundleCardProps {
  bundle: Bundle
}

export const BundleCard = ({ bundle }: BundleCardProps) => {
  const { formatMoney } = useSettings()
  const { addBundle } = useCart()
  const { openCart } = useCartUI()
  const isMixMatch = bundle.bundle_type === 'mix_match' || bundle.bundle_type === 'mix_match_variant'
  const isCollectionFixed = bundle.bundle_type === 'collection_fixed'
  const isFixed = !isMixMatch && !isCollectionFixed
  const { items } = useBundleItems(isFixed ? bundle.id : null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleAddFixed = () => {
    if (items.length === 0) return
    const bundleItems = items
      .filter(item => item.products)
      .map(item => {
        const variant = item.variant_id
          ? item.products!.variants?.find(v => v.id === item.variant_id)
          : undefined
        return { product: item.products!, variant, quantity: item.quantity }
      })
    addBundle(bundle, bundleItems)
    setTimeout(() => openCart(), 300)
  }

  const mainImage = bundle.images?.[0]
  const bundleLink = bundle.slug ? `/paquete/${bundle.slug}` : undefined

  // Price display: handle null bundle_price
  const hasPrice = bundle.bundle_price != null && bundle.bundle_price > 0
  const variantFilterLabel = bundle.variant_filter?.option_value 
    || bundle.variant_filter?.option_values?.[0] 
    || ''

  const imageContent = (
    <div className="aspect-square bg-muted overflow-hidden relative" style={{ aspectRatio: '1/1' }}>
      {mainImage ? (
        <img src={mainImage} alt={bundle.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Package className="w-12 h-12" />
        </div>
      )}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
          Paquete
        </span>
        {bundle.discount_percentage && bundle.discount_percentage > 0 && (
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded font-medium">
            -{bundle.discount_percentage}%
          </span>
        )}
      </div>
    </div>
  )

  return (
    <>
      <Card className="border border-border overflow-hidden bg-card">
        <CardContent className="p-0">
          {bundleLink ? (
            <Link to={bundleLink}>{imageContent}</Link>
          ) : (
            imageContent
          )}

          <div className="p-4">
            {bundleLink ? (
              <Link to={bundleLink}>
                <h3 className="text-foreground font-medium text-sm mb-1 line-clamp-2 hover:underline">
                  {bundle.title}
                </h3>
              </Link>
            ) : (
              <h3 className="text-foreground font-medium text-sm mb-1 line-clamp-2">
                {bundle.title}
              </h3>
            )}
            {bundle.description && (
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                {bundle.description}
              </p>
            )}

            {/* Context text based on type */}
            {isMixMatch ? (
              <p className="text-muted-foreground text-xs mb-3">
                Elige {bundle.pick_quantity || 2} productos
                {variantFilterLabel ? ` (${variantFilterLabel})` : ''}
              </p>
            ) : isCollectionFixed ? (
              <p className="text-muted-foreground text-xs mb-3">
                {bundle.discount_percentage
                  ? `Ahorra ${bundle.discount_percentage}% en productos seleccionados`
                  : 'Ver productos incluidos'}
              </p>
            ) : items.length > 0 ? (
              <p className="text-muted-foreground text-xs mb-3">
                {items.map(i => `${i.quantity}x ${i.products?.title || ''}`).join(' + ')}
              </p>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {hasPrice ? (
                  <>
                    <span className="text-foreground font-semibold">
                      {formatMoney(bundle.bundle_price!)}
                    </span>
                    {bundle.compare_at_price && bundle.compare_at_price > bundle.bundle_price! && (
                      <span className="text-muted-foreground text-xs line-through">
                        {formatMoney(bundle.compare_at_price)}
                      </span>
                    )}
                  </>
                ) : bundle.discount_percentage ? (
                  <span className="text-foreground font-semibold">
                    -{bundle.discount_percentage}%
                  </span>
                ) : null}
              </div>

              {isMixMatch ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  Armar paquete
                </Button>
              ) : isCollectionFixed ? (
                bundleLink ? (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <Link to={bundleLink}>Ver paquete</Link>
                  </Button>
                ) : null
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddFixed}
                  disabled={items.length === 0}
                  className="border-border hover:bg-accent hover:text-accent-foreground"
                >
                  Agregar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isMixMatch && (
        <BundlePicker bundle={bundle} open={pickerOpen} onClose={() => setPickerOpen(false)} />
      )}
    </>
  )
}
