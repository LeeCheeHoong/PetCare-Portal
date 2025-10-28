import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductList } from "@/components/adminProducts/ProductList";
import type { ProductDetail } from "@/components/products/hooks/useSingleProduct";

export const Route = createFileRoute("/admin/products/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	// Handler for creating new product
	const handleCreateNew = () => {
		navigate({ to: "/admin/products/new" });
	};

	// Handler for editing existing product
	const handleEdit = (product: ProductDetail) => {
		navigate({
			to: "/admin/products/$productId/edit",
			params: { productId: product.id },
			replace: true,
		});
	};

	return (
		<div className="container mx-auto py-6">
			<ProductList onEdit={handleEdit} onCreateNew={handleCreateNew} />
		</div>
	);
}
