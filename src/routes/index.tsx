import { ProductListPage } from "@/components/products/ProductListPage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<ProductListPage />
	);
}
