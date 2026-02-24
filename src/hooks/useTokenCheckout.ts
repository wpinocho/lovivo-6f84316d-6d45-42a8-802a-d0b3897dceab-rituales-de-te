import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { callEdge } from '@/lib/edge'
import { STORE_ID } from '@/lib/config'
import { logger } from '@/lib/logger'

export const useTokenCheckout = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    const token = searchParams.get('token')
    if (!token) return

    processedRef.current = true
    setIsLoadingToken(true)
    logger.debug('useTokenCheckout: token found:', token)

    const load = async () => {
      try {
        const res = await callEdge('order-get', { checkout_token: token })
        if (!res || res.error) {
          setTokenError(res?.error || 'Order not found')
          setIsLoadingToken(false)
          return
        }

        logger.debug('useTokenCheckout: Order loaded:', res.order_id)

        // Save to localStorage so the standard checkout picks it up
        const checkoutState = {
          order_id: res.order_id,
          checkout_token: res.checkout_token,
          store_id: res.store_id || STORE_ID,
          updatedAt: Date.now(),
          discount_code: res.discount_code || undefined,
          order: res.order || {
            id: res.order_id,
            store_id: res.store_id || STORE_ID,
            order_number: res.order_number,
            subtotal: res.subtotal,
            tax_amount: res.tax_amount || 0,
            shipping_amount: res.shipping_amount || 0,
            discount_amount: res.discount_amount || 0,
            total_amount: res.total_amount,
            shipping_address: res.shipping_address,
            billing_address: res.billing_address,
            notes: res.notes,
            discount_code: res.discount_code,
            currency_code: res.currency_code,
            status: res.status,
            checkout_token: res.checkout_token,
            created_at: '',
            updated_at: '',
            order_items: res.order_items || [],
          },
        }

        const storageKey = `checkout:${STORE_ID}`
        localStorage.setItem(storageKey, JSON.stringify(checkoutState))
        logger.debug('useTokenCheckout: state saved to localStorage')

        // Clean token from URL and reload so checkout picks up the state
        setSearchParams({}, { replace: true })
        window.location.reload()
      } catch (err) {
        console.error('useTokenCheckout error:', err)
        setTokenError(err instanceof Error ? err.message : 'Failed to load order')
        setIsLoadingToken(false)
      }
    }

    load()
  }, [searchParams, setSearchParams])

  return { isLoadingToken, tokenError, hasToken: !!searchParams.get('token') }
}
