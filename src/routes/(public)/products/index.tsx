import { createFileRoute } from "@tanstack/react-router";
import { ProductListPage } from "@/components/products/ProductListPage";

export const Route = createFileRoute("/(public)/products/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <ProductListPage />;
}
