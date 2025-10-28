import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/pets')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(customer)/pets"!</div>
}
