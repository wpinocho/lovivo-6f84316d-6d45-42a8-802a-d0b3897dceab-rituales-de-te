import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import { ArrowLeft, ShoppingCart, Check, Package } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import type { BundleLogic } from "@/components/headless/HeadlessBundle"

interface BundlePageUIProps {
  logic: BundleLogic
}

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className={cn("w-full h-full flex items-center justify-center bg-muted text-muted-foreground", className)}>
        <Package className="w-16 h-16" />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" className={cn("w-full h-full object-cover", className)} onError={() => setFailed(true)} />
}

export const BundlePageUI = ({ logic }: BundlePageUIProps) => {
  if (logic.loading) {
    return (
      <EcommerceTemplate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </EcommerceTemplate>
    )
  }

  if (logic.notFound || !logic.bundle) {
    return (
      <EcommerceTemplate>
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4">Paquete no encontrado</h1>
          <p className="text-muted-foreground mb-8">El paquete que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </EcommerceTemplate>
    )
  }

  const { bundle } = logic
  const isMixMatch = bundle.bundle_type === 'mix_match' || bundle.bundle_type === 'mix_match_variant'
  const isCollectionFixed = bundle.bundle_type === 'collection_fixed'
  const isFixed = !isMixMatch && !isCollectionFixed
  const images = bundle.images || []
  const hasPrice = bundle.bundle_price != null && bundle.bundle_price > 0
  const showPicker = isMixMatch || isCollectionFixed

  return (
    <EcommerceTemplate>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {images.length > 1 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <ImageWithFallback src={img} alt={`${bundle.title} ${i + 1}`} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : (
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {images[0] ? (
                <ImageWithFallback src={images[0]} alt={bundle.title} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">Paquete</Badge>
              {bundle.discount_percentage && bundle.discount_percentage > 0 && (
                <Badge variant="destructive">-{bundle.discount_percentage}%</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{bundle.title}</h1>
            {hasPrice && (
              <div className="flex items-center gap-4 mt-2">
                <span className="text-2xl font-bold">{logic.formatMoney(bundle.bundle_price!)}</span>
                {bundle.compare_at_price && bundle.compare_at_price > bundle.bundle_price! && (
                  <span className="text-lg text-muted-foreground line-through">
                    {logic.formatMoney(bundle.compare_at_price)}
                  </span>
                )}
              </div>
            )}
            {!hasPrice && bundle.discount_percentage && (
              <p className="text-lg font-semibold text-primary mt-2">
                Ahorra {bundle.discount_percentage}% en estos productos
              </p>
            )}
          </div>

          {bundle.description && (
            <div className="text-muted-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: bundle.description }} />
          )}

          {/* Fixed bundle: show included items and single add button */}
          {isFixed && (
            <div className="space-y-4">
              <h3 className="font-semibold">Incluye:</h3>
              {logic.fixedItems.length > 0 ? (
                <div className="space-y-2">
                  {logic.fixedItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                      {item.products?.images?.[0] && (
                        <img src={item.products.images[0]} alt={item.products.title} className="w-12 h-12 rounded object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.products?.title}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity}x</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Cargando productos...</p>
              )}
              <Button onClick={logic.handleAddFixed} disabled={logic.fixedItems.length === 0} className="w-full" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar paquete al carrito
              </Button>
            </div>
          )}

          {/* Unified picker for collection_fixed and mix_match */}
          {showPicker && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Elige {logic.pickQty} productos:
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {logic.selected.size} de {logic.pickQty} seleccionados
                  </span>
                  {logic.isReady && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      ¡Listo!
                    </span>
                  )}
                </div>
              </div>

              {logic.productsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : logic.products.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No hay productos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {logic.products.map(({ product, matchingVariantId }) => {
                    const isSelected = logic.selected.has(product.id)
                    const isFull = logic.selected.size >= logic.pickQty && !isSelected
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
                        onClick={() => logic.toggleProduct(product.id, product, matchingVariantId)}
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
                            <ImageWithFallback src={image} alt={product.title} />
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
                          <p className="text-xs text-muted-foreground mt-0.5">{logic.formatMoney(displayPrice)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Price summary and confirm */}
              <div className="border-t border-border pt-4 space-y-3">
                {logic.isReady && hasPrice && logic.originalPrice > bundle.bundle_price! && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">{logic.formatMoney(logic.originalPrice)}</span>
                    <span className="text-foreground font-semibold">{logic.formatMoney(bundle.bundle_price!)}</span>
                    <Badge variant="destructive" className="text-xs">
                      Ahorras {logic.formatMoney(logic.originalPrice - bundle.bundle_price!)}
                    </Badge>
                  </div>
                )}
                {logic.isReady && !hasPrice && bundle.discount_percentage && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground line-through">{logic.formatMoney(logic.originalPrice)}</span>
                    <span className="text-foreground font-semibold">
                      {logic.formatMoney(logic.originalPrice * (1 - bundle.discount_percentage / 100))}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      -{bundle.discount_percentage}%
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={logic.handleConfirmMixMatch}
                  disabled={!logic.isReady}
                  className="w-full"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar paquete al carrito
                </Button>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={logic.handleNavigateBack} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        </div>
      </div>
    </EcommerceTemplate>
  )
}
