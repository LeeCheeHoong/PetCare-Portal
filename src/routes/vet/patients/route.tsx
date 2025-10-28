import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/patients')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/patients"!</div>
}
