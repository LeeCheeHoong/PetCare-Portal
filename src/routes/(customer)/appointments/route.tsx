import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/appointments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(customer)/appointments/appointments"!</div>
}
