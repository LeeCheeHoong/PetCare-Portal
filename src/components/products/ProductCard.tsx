import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "./hooks/useSingleProduct";

interface ProductCardProps {
	product: ProductDetail;
	className?: string;
	onAddToCart?: (productId: string) => void;
	onViewDetails?: (productId: string) => void;
}

export const ProductCard = ({
	product,
	className,
	onAddToCart,
	onViewDetails,
}: ProductCardProps) => {
	const hasDiscount =
		product.originalPrice && product.originalPrice > product.price;
	const discountPercentage = hasDiscount
		? Math.round(
				((product.originalPrice! - product.price) / product.originalPrice!) *
					100,
			)
		: 0;

	const handleAddToCart = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation if card is wrapped in Link
		e.stopPropagation();
		onAddToCart?.(product.id);
	};

	const handleViewDetails = () => {
		onViewDetails?.(product.id);
	};

	return (
		<Card
			className={cn(
				"group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
				!product.inStock && "opacity-75",
				className,
			)}
			onClick={handleViewDetails}
		>
			{/* Product Image */}
			<div className="relative aspect-square overflow-hidden rounded-t-lg">
				<img
					src={product.images[0] || "/placeholder-product.jpg"}
					alt={product.name}
					className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
				/>

				{/* Badges */}
				<div className="absolute top-2 left-2 flex flex-col gap-1">
					{hasDiscount && (
						<Badge variant="destructive" className="text-xs font-medium">
							-{discountPercentage}%
						</Badge>
					)}
					{!product.inStock && (
						<Badge variant="secondary" className="text-xs">
							Out of Stock
						</Badge>
					)}
					{product.inStock && product.stockCount <= 5 && (
						<Badge variant="outline" className="text-xs">
							Only {product.stockCount} left
						</Badge>
					)}
				</div>
			</div>

			<CardContent className="p-4">
				{/* Category */}
				<div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
					{product.category.name}
				</div>

				{/* Product Name */}
				<h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
					{product.name}
				</h3>

				{/* Description */}
				<p className="text-xs text-muted-foreground line-clamp-2 mb-3">
					{product.description}
				</p>

				{/* Price */}
				<div className="flex items-baseline gap-2">
					<span className="text-lg font-bold text-primary">
						${product.price.toFixed(2)}
					</span>
					{hasDiscount && (
						<span className="text-sm text-muted-foreground line-through">
							${product.originalPrice!.toFixed(2)}
						</span>
					)}
				</div>
			</CardContent>

			<CardFooter className="p-4 pt-0">
				<Button
					className="w-full"
					variant={product.inStock ? "default" : "secondary"}
					disabled={!product.inStock}
					onClick={handleAddToCart}
				>
					{product.inStock ? (
						<>
							<ShoppingCart className="h-4 w-4 mr-2" />
							Add to Cart
						</>
					) : (
						"Out of Stock"
					)}
				</Button>
			</CardFooter>
		</Card>
	);
};

// Skeleton version for loading states
export const ProductCardSkeleton = ({ className }: { className?: string }) => {
	return (
		<Card className={cn("", className)}>
			<div className="aspect-square">
				<div className="w-full h-full bg-muted animate-pulse rounded-t-lg" />
			</div>
			<CardContent className="p-4">
				<div className="h-3 bg-muted animate-pulse rounded mb-2 w-1/3" />
				<div className="h-4 bg-muted animate-pulse rounded mb-2 w-3/4" />
				<div className="h-3 bg-muted animate-pulse rounded mb-3 w-full" />
				<div className="h-5 bg-muted animate-pulse rounded w-1/2" />
			</CardContent>
			<CardFooter className="p-4 pt-0">
				<div className="h-9 bg-muted animate-pulse rounded w-full" />
			</CardFooter>
		</Card>
	);
};
