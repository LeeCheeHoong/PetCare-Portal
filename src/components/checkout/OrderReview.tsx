import { useState } from 'react'
import { ArrowLeft, CreditCard, MapPin, Package, Truck, Edit, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import type { PaymentMethod, ShippingAddress } from './hooks/useChekout'
import type { Cart } from '../cart/hooks/useCart'

interface OrderReviewProps {
  cart: Cart
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  shippingCost?: number
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

export function OrderReview({
  cart,
  shippingAddress,
  paymentMethod,
  shippingCost,
  onSubmit,
  onBack,
  isSubmitting
}: OrderReviewProps) {
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [agreeToMarketing, setAgreeToMarketing] = useState(false)

  const finalShippingCost = shippingCost ?? cart.shipping
  const finalTotal = cart.subtotal + finalShippingCost + cart.tax

  const getPaymentMethodDisplay = () => {
    switch (paymentMethod.type) {
      case 'card':
        return (
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="capitalize">{paymentMethod.brand}</span>
            <span>•••• {paymentMethod.last4}</span>
          </div>
        )
      case 'paypal':
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center">P</div>
            <span>PayPal</span>
          </div>
        )
      case 'apple_pay':
        return (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center">A</div>
            <span>Apple Pay</span>
          </div>
        )
      default:
        return paymentMethod.type
    }
  }

  const canSubmitOrder = agreeToTerms && !isSubmitting

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                   <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                    />
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {item.quantity}
                  </Badge>
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">{item.product.category.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${item.product.price.toFixed(2)} × {item.quantity}
                    </span>
                    {!item.product.inStock && (
                      <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ${(item.product.originalPrice * item.quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Check for out of stock items */}
            {cart.items.some(item => !item.product.inStock) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some items in your order are out of stock. Please remove them or they will be backordered.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-semibold">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{shippingAddress.address}</div>
              <div>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </div>
              <div>{shippingAddress.country}</div>
              <div className="pt-2 border-t">
                <div>Email: {shippingAddress.email}</div>
                <div>Phone: {shippingAddress.phone}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {getPaymentMethodDisplay()}
          </div>
          {paymentMethod.type === 'card' && paymentMethod.cardholderName && (
            <div className="text-sm text-gray-600 mt-2">
              {paymentMethod.cardholderName}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {finalShippingCost === 0 ? 'Free' : `$${finalShippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${cart.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
            
            {/* Estimated Delivery */}
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Estimated Delivery</span>
                <span>
                  {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                </label>
                <p className="text-xs text-muted-foreground">
                  Required to complete your order
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={agreeToMarketing}
                onCheckedChange={(checked) => setAgreeToMarketing(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="marketing"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Send me promotional emails and updates
                </label>
                <p className="text-xs text-muted-foreground">
                  Optional - you can unsubscribe anytime
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="text-center sm:text-left">
            <div className="text-2xl font-bold">${finalTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">
              Final total including all fees
            </div>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              onClick={onSubmit}
              disabled={!canSubmitOrder}
              size="lg"
              className="flex-1 sm:flex-none min-w-[160px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                'Place Order'
              )}
            </Button>
          </div>
        </div>
        
        {!agreeToTerms && (
          <div className="mt-3 text-sm text-red-600 text-center sm:text-right">
            Please agree to the terms and conditions to continue
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <div>🔒 Your payment information is secure and encrypted</div>
        <div>💳 We never store your full credit card details</div>
      </div>
    </div>
  )
}