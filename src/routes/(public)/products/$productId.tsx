import { ProductDetailPage } from '@/components/products/ProductDetailPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/products/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductDetailPage />
}
