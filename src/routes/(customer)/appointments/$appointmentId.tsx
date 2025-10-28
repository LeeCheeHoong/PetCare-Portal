import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(customer)/appointments/$appointmentId')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/(customer)/appointments/$appointmentId"!</div>
}
