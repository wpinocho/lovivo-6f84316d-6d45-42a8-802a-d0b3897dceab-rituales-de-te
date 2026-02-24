import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { EcommerceTemplate } from "@/templates/EcommerceTemplate"
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Package, Loader2, Tag, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/money"
import { FreeShippingBar } from "@/components/ui/FreeShippingBar"
import type { Discount } from "@/lib/discount-utils"

interface CartUIProps {
  logic: {
    items: any[]
    total: number
    itemCount: number
    isEmpty: boolean
    updateQuantity: (key: string, quantity: number) => void
    removeItem: (key: string) => void
    handleCreateCheckout: () => void
    handleNavigateHome: () => void
    handleNavigateBack: () => void
    isCreatingOrder: boolean
    currencyCode: string
    onCheckoutStart: () => void
    onCheckoutComplete: () => void
    // Discount
    couponCode: string
    setCouponCode: (code: string) => void
    discount: Discount | null
    isValidatingCoupon: boolean
    validateCoupon: () => void
    removeCoupon: () => void
  }
}

export const CartUI = ({ logic }: CartUIProps) => {
  return (
    <EcommerceTemplate pageTitle="Tu Carrito" showCart={false}>
      <div className="max-w-6xl mx-auto">
        {logic.isEmpty ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8 text-lg">Agrega algunos productos para comenzar tu compra</p>
            <Button onClick={logic.handleNavigateHome} size="lg">Seguir Comprando</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <FreeShippingBar
                cartTotal={logic.total}
                cartQuantity={logic.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}
              />
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Productos ({logic.itemCount})</h2>
                <Button variant="ghost" onClick={logic.handleNavigateBack} className="text-muted-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Seguir comprando
                </Button>
              </div>

              {logic.items.map((item) => (
                <Card key={item.key}>
                  <CardContent className="p-6">
                    {item.type === 'bundle' ? (
                      /* --- Bundle --- */
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {item.bundle.images?.[0] ? (
                            <img src={item.bundle.images[0]} alt={item.bundle.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{item.bundle.title}</h3>
                            <Badge variant="secondary" className="shrink-0">Paquete</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {item.bundleItems.map((bi: any) => `${bi.quantity}x ${bi.product.title}`).join(' + ')}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button variant="outline" size="icon" onClick={() => logic.updateQuantity(item.key, item.quantity - 1)} className="h-9 w-9">
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium text-lg px-3">{item.quantity}</span>
                              <Button variant="outline" size="icon" onClick={() => logic.updateQuantity(item.key, item.quantity + 1)} className="h-9 w-9">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatMoney(item.bundle.bundle_price * item.quantity, logic.currencyCode)}
                              </div>
                              {item.bundle.compare_at_price && item.bundle.compare_at_price > item.bundle.bundle_price && (
                                <div className="text-muted-foreground text-sm line-through">
                                  {formatMoney(item.bundle.compare_at_price * item.quantity, logic.currencyCode)}
                                </div>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => logic.removeItem(item.key)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* --- Product --- */
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {(item.product?.images?.length > 0) || item.variant?.image || item.variant?.image_urls?.length ? (
                            <img src={item.variant?.image_urls?.[0] || item.variant?.image || item.product.images![0]} alt={item.product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sin imagen</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2">{item.product.title}</h3>
                          {item.variant?.title && <p className="text-muted-foreground mb-3">{item.variant.title}</p>}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button variant="outline" size="icon" onClick={() => logic.updateQuantity(item.key, item.quantity - 1)} className="h-9 w-9">
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium text-lg px-3">{item.quantity}</span>
                              <Button variant="outline" size="icon" onClick={() => logic.updateQuantity(item.key, item.quantity + 1)} className="h-9 w-9">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatMoney(((item.variant?.price ?? item.product.price) || 0) * item.quantity, logic.currencyCode)}
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => logic.removeItem(item.key)} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader><CardTitle>Resumen del Pedido</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal ({logic.itemCount} artículos)</span>
                        <span>{formatMoney(logic.total, logic.currencyCode)}</span>
                      </div>

                      {/* Discount code input */}
                      {!logic.discount ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Código de descuento"
                            value={logic.couponCode}
                            onChange={(e) => logic.setCouponCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && logic.validateCoupon()}
                            className="h-9 text-sm"
                            disabled={logic.isValidatingCoupon}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={logic.validateCoupon}
                            disabled={logic.isValidatingCoupon || !logic.couponCode.trim()}
                            className="shrink-0 h-9"
                          >
                            {logic.isValidatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : "Aplicar"}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between rounded-md border border-border bg-secondary/50 px-3 py-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{logic.discount.code}</span>
                            <span className="text-muted-foreground">
                              {logic.discount.discount_type === 'percentage' ? `${logic.discount.value}%` : `$${logic.discount.value}`}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={logic.removeCoupon} className="h-auto p-1 text-muted-foreground hover:text-foreground">
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}

                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatMoney(logic.total, logic.currencyCode)}</span>
                      </div>
                      <div className="space-y-3 pt-4">
                        <Button className="w-full" size="lg" onClick={() => { logic.onCheckoutStart(); logic.handleCreateCheckout() }} disabled={logic.isCreatingOrder}>
                          {logic.isCreatingOrder ? 'Procesando...' : 'Pagar'}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={logic.handleNavigateHome}>Seguir Comprando</Button>
                      </div>
                    </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </EcommerceTemplate>
  )
}
