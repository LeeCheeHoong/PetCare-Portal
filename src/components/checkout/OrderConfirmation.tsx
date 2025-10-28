import { useEffect } from 'react'
import { Check, Package, Truck, MapPin, CreditCard, Calendar, Copy, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCart } from '@/components/cart/hooks/useCart'
import type { ShippingAddress } from './hooks/useChekout'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  estimatedDelivery: string
  trackingNumber: string
  items: {
    id: string
    productId: string
    productName: string
    productImage: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  pricing: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  createdAt: string
}

interface OrderConfirmationProps {
  order: Order
  shippingAddress: ShippingAddress
}

export function OrderConfirmation({ order, shippingAddress }: OrderConfirmationProps) {
  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber)
    toast("Copied!",{
      description: "Order number copied to clipboard"
    })
  }

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(order.trackingNumber)
    toast("Copied!",{
      description: "Tracking number copied to clipboard"
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-900">Order Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>
      </div>

      {/* Order Summary Alert */}
      <Alert className="border-green-200 bg-green-50">
        <Package className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>What's next?</strong> You'll receive an email confirmation shortly with your order details and tracking information.
        </AlertDescription>
      </Alert>

      {/* Order Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Order Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyOrderNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Order Date</span>
                <span className="text-sm">
                  {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Status</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Amount</span>
                <span className="font-semibold text-lg">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Tracking Number</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{order.trackingNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyTrackingNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatDate(order.estimatedDelivery)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Standard Shipping
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium">
                      {shippingAddress.firstName} {shippingAddress.lastName}
                    </div>
                    <div className="text-gray-600">
                      {shippingAddress.address}
                    </div>
                    <div className="text-gray-600">
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                    </div>
                    <div className="text-gray-600">
                      {shippingAddress.country}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                   <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                    />
                </div>
                
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold">{item.productName}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-sm text-gray-600">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
            
            <Separator />
            
            {/* Order Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${order.pricing.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${order.pricing.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link to={`/orders/${order.id}`}>
            <Package className="mr-2 h-4 w-4" />
            View Order Details
          </Link>
        </Button>
        
        <Button variant="outline" asChild size="lg">
          <Link to="/products">
            Continue Shopping
          </Link>
        </Button>
      </div>

      {/* Help Section */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Need Help?</h3>
            <p className="text-sm text-gray-600">
              If you have any questions about your order, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/support">
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/orders">
                  View All Orders
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Expected Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Order Confirmed</div>
                <div className="text-sm text-gray-600">Today - Order has been received and confirmed</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Processing</div>
                <div className="text-sm text-gray-600">1-2 business days - Your order is being prepared</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Shipped</div>
                <div className="text-sm text-gray-600">2-3 business days - Your order is on its way</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium">Delivered</div>
                <div className="text-sm text-gray-600">
                  {formatDate(order.estimatedDelivery)} - Package arrives at your door
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}