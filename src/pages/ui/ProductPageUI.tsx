import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

import type { Product, ProductVariant } from "@/lib/supabase"
import { VolumeBadge } from "@/components/ui/VolumeBadge"
import { BOGOLabel } from "@/components/ui/BOGOLabel"

/**
 * EDITABLE UI COMPONENT - ProductPageUI
 * 
 * Este componente solo maneja la presentación de la página de producto.
 * Recibe toda la lógica como props del HeadlessProduct.
 * 
 * PUEDES MODIFICAR LIBREMENTE:
 * - Colores, temas, estilos
 * - Textos e idioma
 * - Layout y estructura visual
 * - Header y navegación
 * - Animaciones y efectos
 * - Agregar features visuales (zoom de imagen, etc.)
 */

interface ProductPageUIProps {
  logic: {
    // Product data
    product: any
    loading: boolean
    notFound: boolean
    
    // Selection state
    selected: Record<string, string>
    quantity: number
    
    // Calculated values
    matchingVariant: any
    currentPrice: number
    currentCompareAt: number | null
    currentImage: string | null
    inStock: boolean
    
    // Handlers
    handleOptionSelect: (optionName: string, value: string) => void
    handleQuantityChange: (quantity: number) => void
    handleAddToCart: () => void
    handleNavigateBack: () => void
    isOptionValueAvailable: (optionName: string, value: string) => boolean
    
    // Any other properties that might come from HeadlessProduct
    [key: string]: any
  }
}

export const ProductPageUI = ({ logic }: ProductPageUIProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { ref: ctaRef, inView: ctaInView } = useInView({ threshold: 0 })
  
  // Current displayed image (selected thumbnail or variant image or first image)
  const displayImage = selectedImage || logic.displayImages?.[0] || logic.currentImage || "/placeholder.svg"
  
  // Reset selected image when variant changes
  useEffect(() => {
    setSelectedImage(null)
  }, [logic.matchingVariant])
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (logic.loading) {
    return (
      <EcommerceTemplate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </EcommerceTemplate>
    )
  }

  if (logic.notFound) {
    return (
      <EcommerceTemplate>
        <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8">El producto que buscas no existe o ha sido eliminado.</p>
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

  if (!logic.product) return null

  return (
    <EcommerceTemplate hideFloatingCartOnMobile>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images Gallery */}
        <div className="space-y-4">
          {/* Main Image - Desktop */}
          <div className="hidden md:block aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={displayImage}
              alt={logic.product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Mobile Carousel */}
          {logic.displayImages && logic.displayImages.length > 1 ? (
            <div className="md:hidden">
              <Carousel className="w-full">
                <CarouselContent>
                  {logic.displayImages.map((img: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                     <img
                          src={img}
                          alt={`${logic.product.title} ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          ) : (
            <div className="md:hidden aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={displayImage}
                alt={logic.product.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Thumbnails - Desktop only */}
          {logic.displayImages && logic.displayImages.length > 1 && (
            <div className="hidden md:flex gap-2 overflow-x-auto pb-2">
              {logic.displayImages.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={cn(
                    "flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                    (selectedImage === img || (!selectedImage && logic.currentImage === img) || (!selectedImage && !logic.currentImage && index === 0))
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  <img
                    src={img}
                    alt={`${logic.product.title} miniatura ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{logic.product.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-2xl font-bold">
                {logic.formatMoney(logic.currentPrice)}
              </span>
              {logic.currentCompareAt && logic.currentCompareAt > logic.currentPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {logic.formatMoney(logic.currentCompareAt)}
                </span>
              )}
            </div>
            {/* Price rule badges */}
            {logic.product?.id && (
              <div className="flex flex-wrap gap-2 mt-3">
                <VolumeBadge productId={logic.product.id} />
                <BOGOLabel productId={logic.product.id} />
              </div>
            )}
          </div>

          {logic.product.description && (
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <div 
                className="text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: logic.product.description }}
              />
            </div>
          )}

          {/* Product Options */}
          {logic.product.options && logic.product.options.length > 0 && (
            <div className="space-y-4">
              {logic.product.options.map((option) => (
                <div key={option.name}>
                  <Label className="text-base font-medium">{option.name}</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {option.values.map((value) => {
                      const isSelected = logic.selected[option.name] === value
                      const isAvailable = logic.isOptionValueAvailable(option.name, value)
                      
                      return (
                        <Button
                          key={value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => logic.handleOptionSelect(option.name, value)}
                          className={!isAvailable ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {value}
                          {!isAvailable && (
                            <span className="ml-1 text-xs">(Agotado)</span>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="quantity" className="text-base font-medium">
                Cantidad
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => logic.handleQuantityChange(Math.max(1, logic.quantity - 1))}
                  disabled={logic.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={logic.quantity}
                  onChange={(e) => logic.handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => logic.handleQuantityChange(logic.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div ref={ctaRef} className="flex flex-col gap-3">
              <Button
                onClick={logic.handleAddToCart}
                disabled={!logic.inStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {logic.inStock ? 'Agregar al carrito' : 'Agotado'}
              </Button>
              
              {logic.inStock && (
                <Button
                  onClick={logic.handleBuyNow}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Comprar ahora
                </Button>
              )}
              
              {!logic.inStock && (
                <Badge variant="secondary" className="w-fit">Agotado</Badge>
              )}
            </div>
          </div>


          <Separator />

          <Button
            variant="outline"
            onClick={logic.handleNavigateBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Seguir comprando
          </Button>
        </div>
      </div>
      {/* Sticky Add to Cart Bar */}
      {logic.inStock && (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]",
            ctaInView ? "translate-y-full" : "translate-y-0"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <h3 className="font-semibold truncate">{logic.product.title}</h3>
                <span className="font-bold text-lg shrink-0">
                  {logic.formatMoney(logic.currentPrice)}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button onClick={logic.handleAddToCart} size="default">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Agregar al carrito
                </Button>
                <Button onClick={logic.handleBuyNow} variant="outline" size="default">
                  Comprar ahora
                </Button>
              </div>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{logic.product.title}</h3>
                <span className="font-bold shrink-0">
                  {logic.formatMoney(logic.currentPrice)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button onClick={logic.handleAddToCart} size="sm" className="flex-1">
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  Agregar al carrito
                </Button>
                <Button onClick={logic.handleBuyNow} variant="outline" size="sm" className="flex-1">
                  Comprar ahora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </EcommerceTemplate>
  )
}