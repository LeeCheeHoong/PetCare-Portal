import CheckoutPage from '@/components/checkout/CheckoutPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/checkout')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CheckoutPage />
}
