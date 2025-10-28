import ShoppingCartPage from '@/components/cart/ShoppingCartPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/cart')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ShoppingCartPage />
}
