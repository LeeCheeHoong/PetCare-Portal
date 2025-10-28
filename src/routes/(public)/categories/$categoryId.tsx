import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(public)/categories/$categoryId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/categories/$categories"!</div>
}
