import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/adminProducts/ProductForm";

export const Route = createFileRoute("/admin/products/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ProductForm mode={"create"} />;
}
