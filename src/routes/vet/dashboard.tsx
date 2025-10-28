import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/dashboard"!</div>
}
