import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/patients/$petId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/patients/$petId"!</div>
}
