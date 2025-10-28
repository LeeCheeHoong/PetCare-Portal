import { useState } from 'react'
import { ArrowLeft, Check, CreditCard, Truck, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCart } from '@/components/cart/hooks/useCart'
import { useCheckout, type CheckoutData, type PaymentMethod, type ShippingAddress } from '@/components/checkout/hooks/useChekout'
import { Link } from '@tanstack/react-router'
import { ShippingForm } from './ShippingForm'
import { PaymentForm } from './PaymentForm'
import { OrderReview } from './OrderReview'
import { OrderConfirmation } from './OrderConfirmation'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

const steps = [
  { id: 'shipping', title: 'Shipping', icon: Truck },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'review', title: 'Review', icon: ShoppingBag },
  { id: 'confirmation', title: 'Confirmation', icon: Check },
]

export default function CheckoutPage() {
  const { cart, isEmpty, isLoading: isLoadingCart } = useCart()
  const {
    createOrder,
    isCreatingOrder,
    orderData,
    validateShipping,
    isValidatingShipping,
    calculateShipping,
    isCalculatingShipping,
    shippingCost
  } = useCheckout()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping')
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({})

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleShippingSubmit = async (shippingData: ShippingAddress) => {
    // Validate shipping address
    validateShipping(shippingData, {
      onSuccess: () => {
        // Calculate shipping cost
        calculateShipping(shippingData, {
          onSuccess: (shippingResult) => {
            setCheckoutData(prev => ({ 
              ...prev, 
              shippingAddress: shippingData,
              orderSummary: {
                ...prev.orderSummary,
                shipping: 156
              }
            }))
            setCurrentStep('payment')
          }
        })
      }
    })
  }

  const handlePaymentSubmit = (paymentData: PaymentMethod) => {
    setCheckoutData(prev => ({ ...prev, paymentMethod: paymentData }))
    setCurrentStep('review')
  }

  const handleOrderSubmit = () => {
    if (!cart || !checkoutData.shippingAddress || !checkoutData.paymentMethod) return

    const orderData: CheckoutData = {
      shippingAddress: checkoutData.shippingAddress,
      paymentMethod: checkoutData.paymentMethod,
      orderSummary: {
        subtotal: cart.subtotal,
        shipping: shippingCost?.cost || cart.shipping,
        tax: cart.tax,
        total: cart.total + (shippingCost?.cost || 0)
      }
    }

    createOrder(orderData, {
      onSuccess: () => {
        setCurrentStep('confirmation')
      }
    })
  }

  const goToPreviousStep = () => {
    const stepOrder: CheckoutStep[] = ['shipping', 'payment', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // Redirect if cart is empty
  if (!isLoadingCart && isEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-400" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-gray-600">Add some products before checkout!</p>
          </div>
          <Button asChild>
            <Link to="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (isLoadingCart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="mb-6">
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isCompleted = index < currentStepIndex
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                    ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 bg-white text-gray-400'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-primary' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'shipping' && (
            <ShippingForm 
              onSubmit={handleShippingSubmit}
              initialData={checkoutData.shippingAddress}
              isValidating={isValidatingShipping}
              isCalculatingShipping={isCalculatingShipping}
            />
          )}
          
          {currentStep === 'payment' && (
            <PaymentForm 
              onSubmit={handlePaymentSubmit}
              onBack={goToPreviousStep}
              initialData={checkoutData.paymentMethod}
            />
          )}
          
          {currentStep === 'review' && (
            <OrderReview
              cart={cart!}
              shippingAddress={checkoutData.shippingAddress!}
              paymentMethod={checkoutData.paymentMethod!}
              shippingCost={shippingCost?.cost || cart!.shipping}
              onSubmit={handleOrderSubmit}
              onBack={goToPreviousStep}
              isSubmitting={isCreatingOrder}
            />
          )}
          
          {currentStep === 'confirmation' && (
            <OrderConfirmation 
              order={orderData}
              shippingAddress={checkoutData.shippingAddress!}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        {currentStep !== 'confirmation' && (
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart?.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cart?.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {isCalculatingShipping ? (
                        <span className="text-xs">Calculating...</span>
                      ) : shippingCost ? (
                        `$${shippingCost.cost.toFixed(2)}`
                      ) : cart?.shipping === 0 ? (
                        'Free'
                      ) : (
                        `$${cart?.shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${cart?.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      ${((cart?.subtotal || 0) + (shippingCost?.cost || cart?.shipping || 0) + (cart?.tax || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}