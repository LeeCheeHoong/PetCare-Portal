import { ProductListPage } from '@/components/products/ProductListPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductListPage />
}
