import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/appointments/$appointmentId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/appointments/$appointmentId"!</div>
}
