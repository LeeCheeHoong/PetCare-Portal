import OrderPage from '@/components/order/OrderPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/orders/$orderId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrderPage />
}
