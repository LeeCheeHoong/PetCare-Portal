import { useState } from 'react'
import { Package, Eye, Download, RotateCcw, Truck, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrders } from '@/components/order/hooks/useOrders'
import { Link } from '@tanstack/react-router'


export default function OrderListPage() {
  const [page, setPage] = useState(1)
  const { data: ordersData, isLoading, error } = useOrders({ page, limit: 10 })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load orders. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your order history</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!ordersData?.orders || ordersData.orders.length === 0) && (
        <div className="text-center py-16">
          <Package className="mx-auto h-24 w-24 text-gray-400 mb-6" />
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">No orders yet</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              When you place your first order, it will appear here. Start shopping to see your order history!
            </p>
            <Button asChild size="lg">
              <Link to="/products">
                Start Shopping
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && ordersData?.orders && ordersData.orders.length > 0 && (
        <div className="space-y-6">
          {ordersData.orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Ordered {formatDate(order.orderDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${order.totalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/orders/$orderId`} params={{orderId: order.id}}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Order Items Preview */}
                <div className="space-y-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.productName} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  
                  {order.items.length > 3 && (
                    <div className="text-center py-2 border-t">
                      <span className="text-sm text-gray-600">
                        +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Shipping Info */}
                {order.shipping.trackingNumber && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.shipping.trackingNumber}</span>
                      </div>
                      {order.shipping.estimatedDelivery && (
                        <div className="text-sm text-gray-600">
                          Est. delivery: {formatDate(order.shipping.estimatedDelivery)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="font-medium">Ship to:</span>
                    <span>
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}, {order.shippingAddress.city}, {order.shippingAddress.state}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Return Items
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Buy Again
                    </Button>
                    {order.shipping.trackingNumber && (
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`https://ups.com/track?number=${order.shipping.trackingNumber}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Track Package
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {ordersData.pagination && ordersData.pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {ordersData.pagination.page} of {ordersData.pagination.totalPages}
                </span>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= ordersData.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}