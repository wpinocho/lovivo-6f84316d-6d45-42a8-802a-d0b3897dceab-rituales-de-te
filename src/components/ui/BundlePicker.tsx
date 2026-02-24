import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, Package } from 'lucide-react'
import type { Bundle, Product, ProductVariant } from '@/lib/supabase'
import { useSettings } from '@/contexts/SettingsContext'
import { useCart } from '@/contexts/CartContext'
import { useCartUI } from '@/components/CartProvider'
import { useBundlePickerProducts } from '@/hooks/useBundlePickerProducts'
import { cn } from '@/lib/utils'

interface BundlePickerProps {
  bundle: Bundle
  open: boolean
  onClose: () => void
}

export const BundlePicker = ({ bundle, open, onClose }: BundlePickerProps) => {
  const { formatMoney } = useSettings()
  const { addItem } = useCart()
  const { openCart } = useCartUI()
  const { products, loading } = useBundlePickerProducts(
    bundle.source_collection_id,
    bundle.variant_filter
  )

  const [selected, setSelected] = useState<Map<string, { product: Product; variant?: ProductVariant }>>(new Map())

  const pickQty = bundle.pick_quantity || 2

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

  const originalPrice = useMemo(() => {
    let total = 0
    selected.forEach(({ product, variant }) => {
      total += variant?.price ?? product.price
    })
    return total
  }, [selected])

  const isReady = selected.size === pickQty

  const handleConfirm = () => {
    selected.forEach(({ product, variant }) => {
      addItem(product, variant)
    })
    setSelected(new Map())
    onClose()
    setTimeout(() => openCart(), 300)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelected(new Map())
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{bundle.title}</DialogTitle>
          <DialogDescription>
            {bundle.description || `Elige ${pickQty} productos para armar tu paquete`}
          </DialogDescription>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-muted-foreground">
              {selected.size} de {pickQty} seleccionados
            </span>
            {isReady && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                ¡Listo!
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
              {products.map(({ product, matchingVariantId }) => {
                const isSelected = selected.has(product.id)
                const isFull = selected.size >= pickQty && !isSelected
                const matchingVariant = matchingVariantId
                  ? product.variants?.find(v => v.id === matchingVariantId)
                  : undefined
                const image = matchingVariant?.image_urls?.[0]
                  || matchingVariant?.image
                  || product.images?.[0]
                const displayPrice = matchingVariant?.price ?? product.price

                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={isFull}
                    onClick={() => toggleProduct(product.id, product, matchingVariantId)}
                    className={cn(
                      'relative rounded-lg border overflow-hidden text-left transition-all',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-border hover:border-primary/50',
                      isFull && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      {image ? (
                        <img src={image} alt={product.title} loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center'); const icon = document.createElement('div'); icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/></svg>'; e.currentTarget.parentElement?.appendChild(icon); }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}

                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground line-clamp-2">{product.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatMoney(displayPrice)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 border-t pt-4">
          <div className="flex-1 text-sm">
            {isReady && bundle.bundle_price != null && originalPrice > bundle.bundle_price && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground line-through">{formatMoney(originalPrice)}</span>
                <span className="text-foreground font-semibold">{formatMoney(bundle.bundle_price!)}</span>
                <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-medium">
                  Ahorras {formatMoney(originalPrice - bundle.bundle_price!)}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={!isReady}
          >
            Agregar al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
