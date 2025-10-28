import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vet/schedule')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vet/schedule"!</div>
}
