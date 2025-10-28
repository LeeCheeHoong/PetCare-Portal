import OrderListPage from '@/components/order/OrderListPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrderListPage />
}
