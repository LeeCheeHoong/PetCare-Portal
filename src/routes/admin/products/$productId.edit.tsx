import { createFileRoute, useParams } from "@tanstack/react-router";
import { ProductForm } from "@/components/adminProducts/ProductForm";

export const Route = createFileRoute("/admin/products/$productId/edit")({
	component: RouteComponent,
});

function RouteComponent() {
	const { productId } = useParams({ from: "/admin/products/$productId/edit" });

	return <ProductForm productId={productId} mode={"edit"} />;
}
