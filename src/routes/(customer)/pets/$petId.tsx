import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/pets/$petId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(customer)/pets/$petId"!</div>
}
