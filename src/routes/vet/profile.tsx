import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/profile"!</div>
}
