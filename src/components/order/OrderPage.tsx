import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useOrderDetails, useCancelOrder, useRequestReturn } from '@/components/order/hooks/useOrders'
import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { Check, Package, Truck, X, Clock, AlertCircle, ArrowLeft, Copy, Download, RotateCcw, ExternalLink, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

export default function OrderDetailsPage() {
  const {orderId} = useParams({from: '/(customer)/orders/$orderId'})
  
  const { data: order, isLoading, error, refetch } = useOrderDetails(orderId)
  const cancelOrderMutation = useCancelOrder()
  const requestReturnMutation = useRequestReturn()
  
  const [returnReason, setReturnReason] = useState('')
  const [selectedReturnItems, setSelectedReturnItems] = useState<string[]>([])

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.orderNumber)
      toast("Copied!",{
        description: "Order number copied to clipboard"
      })
    }
  }

  const copyTrackingNumber = () => {
    if (order?.shipping.trackingNumber) {
      navigator.clipboard.writeText(order.shipping.trackingNumber)
      toast("Copied!",{
        description: "Tracking number copied to clipboard"
      })
    }
  }

  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(orderId, {
      onSuccess: () => {
        toast("Order cancelled",{
          description: "Your order has been successfully cancelled."
        })
      },
      onError: () => {
        toast.warning("Cancellation failed",{
          description: "Unable to cancel order. Please contact support.",
        })
      }
    })
  }

  const handleRequestReturn = () => {
    if (!returnReason.trim()) {
      toast("Reason required",{
        description: "Please provide a reason for the return.",
      })
      return
    }

    requestReturnMutation.mutate(
      { 
        orderId, 
        items: selectedReturnItems, 
        reason: returnReason 
      },
      {
        onSuccess: () => {
          toast("Return requested",{
            description: "Your return request has been submitted."
          })
          setReturnReason('')
          setSelectedReturnItems([])
        },
        onError: () => {
          toast("Return request failed",{
            description: "Unable to process return request. Please try again.",
          })
        }
      }
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-orange-600" />
      case 'delivered':
        return <Check className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCancelOrder = order?.status === 'confirmed' || order?.status === 'processing'
  const canRequestReturn = order?.status === 'delivered'

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message === 'Order not found' 
              ? 'Order not found. Please check the order ID and try again.'
              : 'Failed to load order details. Please try again.'
            }
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => refetch()}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Order #</span>
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
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            {canCancelOrder && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Keep Order</Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelOrder}
                      disabled={cancelOrderMutation.isPending}
                    >
                      {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {canRequestReturn && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Return Items
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request Return</DialogTitle>
                    <DialogDescription>
                      Select items you'd like to return and provide a reason.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reason">Reason for return</Label>
                      <Textarea
                        id="reason"
                        placeholder="Please describe why you want to return these items..."
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                      />
                    </div>
                    {/* Return items selection would go here */}
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleRequestReturn}
                      disabled={requestReturnMutation.isPending}
                    >
                      {requestReturnMutation.isPending ? 'Submitting...' : 'Submit Return Request'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.statusHistory.map((status, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${index === 0 ? 'bg-blue-100' : 'bg-gray-100'}
                      `}>
                        {getStatusIcon(status.status)}
                      </div>
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">
                          {status.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(status.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{status.note}</p>
                      {status.location && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {status.location}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items Ordered</CardTitle>
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
                      <Link 
                        to={`/products/$productId`}
                        params={{productId: item.productId}}
                        className="font-semibold hover:text-blue-600 hover:underline"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="font-semibold">
                        ${item.totalPrice.toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/products/$productId`} params={{productId: item.productId}}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Info */}
          {order.shipping && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tracking</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{order.shipping.trackingNumber}</span>
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
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Carrier</span>
                  <span className="text-sm">{order.shipping.carrier}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Method</span>
                  <span className="text-sm capitalize">{order.shipping.method}</span>
                </div>
                
                {order.shipping.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Est. Delivery</span>
                    <span className="text-sm">
                      {new Date(order.shipping.estimatedDelivery).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {order.shipping.trackingUrl && (
                  <Button variant="outline" className="w-full mt-3" asChild>
                    <a href={order.shipping.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Track Package
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </div>
                <div>{order.shippingAddress.address}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </div>
                <div>{order.shippingAddress.country}</div>
                <div className="pt-2 border-t">
                  <div>{order.shippingAddress.email}</div>
                  <div>{order.shippingAddress.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="capitalize">{order.paymentMethod.brand}</span>
                  <span>•••• {order.paymentMethod.last4}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.pricing.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.pricing.tax.toFixed(2)}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${order.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}