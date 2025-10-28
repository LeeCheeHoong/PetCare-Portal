import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/appointments')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/appointments"!</div>
}
