import { Link, useParams } from "@tanstack/react-router";
import {
	ArrowLeft,
	ChevronRight,
	Heart,
	Minus,
	Plus,
	Share2,
	ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useProductPageData } from "@/components/products/hooks/useSingleProduct";
import { ProductCard } from "@/components/products/ProductCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const ProductDetailPage = () => {
	// TODO
	const { productId } = useParams({ from: "/(public)/products/$productId" });

	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const { product, relatedProducts, isLoading, error } =
		useProductPageData(productId);

	useEffect(() => {
		if (error) {
			console.log(error);
		}
	}, [error]);

	const handleQuantityChange = (change: number) => {
		setQuantity((prev) =>
			Math.max(1, Math.min(prev + change, product.data?.stockCount || 1)),
		);
	};

	const handleAddToCart = () => {
		if (!product.data) return;
		console.log(`Adding ${quantity} of product ${product.data.id} to cart`);
		// Add to cart logic here
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-6">
				<ProductDetailSkeleton />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="container mx-auto px-4 py-6">
				<Alert variant="destructive">
					<AlertDescription>
						{error.message === "Product not found"
							? "Product not found. It may have been removed or the link is incorrect."
							: "Failed to load product details. Please try again later."}
					</AlertDescription>
				</Alert>
				<Button asChild variant="outline" className="mt-4">
					<Link to="/products">
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Products
					</Link>
				</Button>
			</div>
		);
	}

	if (!product.data) return null;

	const hasDiscount =
		product.data.originalPrice &&
		product.data.originalPrice > product.data.price;
	const discountPercentage = hasDiscount
		? Math.round(
				((product.data.originalPrice! - product.data.price) /
					product.data.originalPrice!) *
					100,
			)
		: 0;

	return (
		<div className="container mx-auto px-4 py-6">
			{/* Breadcrumb */}
			<nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
				<Link to="/" className="hover:text-foreground">
					Home
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link to="/products" className="hover:text-foreground">
					Products
				</Link>
				<ChevronRight className="h-4 w-4" />
				<Link
					to={`/categories/$categoryId`}
					params={{ categoryId: product.data.category.id }}
					className="hover:text-foreground"
				>
					{product.data.category.name}
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">{product.data.name}</span>
			</nav>

			{/* Back Button */}
			<Button asChild variant="ghost" className="mb-6">
				<Link to={"/products"}>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Products
				</Link>
			</Button>

			{/* Main Product Content */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
				{/* Product Images */}
				<div className="space-y-4">
					{/* Main Image */}
					<div className="aspect-square overflow-hidden rounded-lg border">
						<img
							src={
								product.data.images[selectedImageIndex] ||
								"/placeholder-product.jpg"
							}
							alt={product.data.name}
							className="w-full h-full object-cover"
						/>
					</div>

					{/* Thumbnail Images */}
					{product.data.images.length > 1 && (
						<div className="grid grid-cols-4 gap-2">
							{product.data.images.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImageIndex(index)}
									className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
										selectedImageIndex === index
											? "border-primary"
											: "border-muted hover:border-muted-foreground"
									}`}
								>
									<img
										src={image}
										alt={`${product.data.name} ${index + 1}`}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Information */}
				<div className="space-y-6">
					{/* Category */}
					<div className="text-sm text-muted-foreground uppercase tracking-wide">
						{product.data.category.name}
					</div>

					{/* Product Name */}
					<h1 className="text-3xl font-bold tracking-tight">
						{product.data.name}
					</h1>

					{/* Price */}
					<div className="flex items-baseline gap-3">
						<span className="text-3xl font-bold text-primary">
							${product.data.price.toFixed(2)}
						</span>
						{hasDiscount && (
							<>
								<span className="text-xl text-muted-foreground line-through">
									${product.data.originalPrice!.toFixed(2)}
								</span>
								<Badge variant="destructive">Save {discountPercentage}%</Badge>
							</>
						)}
					</div>

					{/* Stock Status */}
					<div className="flex items-center gap-2">
						{product.data.inStock ? (
							<>
								<Badge
									variant="outline"
									className="text-green-600 border-green-600"
								>
									In Stock
								</Badge>
								{product.data.stockCount <= 5 && (
									<span className="text-sm text-muted-foreground">
										Only {product.data.stockCount} left!
									</span>
								)}
							</>
						) : (
							<Badge variant="destructive">Out of Stock</Badge>
						)}
					</div>

					{/* Description */}
					<div className="space-y-3">
						<p className="text-muted-foreground leading-relaxed">
							{product.data.description}
						</p>
						{product.data.detailedDescription && (
							<p className="text-sm text-muted-foreground leading-relaxed">
								{product.data.detailedDescription}
							</p>
						)}
					</div>

					<Separator />

					{/* Quantity and Add to Cart */}
					{product.data.inStock && (
						<div className="space-y-4">
							{/* Quantity Selector */}
							<div className="flex items-center gap-3">
								<span className="text-sm font-medium">Quantity:</span>
								<div className="flex items-center border rounded-md">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleQuantityChange(-1)}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="px-4 py-2 text-center min-w-[60px]">
										{quantity}
									</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => handleQuantityChange(1)}
										disabled={quantity >= product.data.stockCount}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3">
								<Button className="flex-1" size="lg" onClick={handleAddToCart}>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Related Products */}
			{relatedProducts.data && relatedProducts.data.length > 0 && (
				<div className="space-y-6">
					<h2 className="text-2xl font-bold">You might also like</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						{relatedProducts.data.map((relatedProduct) => (
							<ProductCard key={relatedProduct.id} product={relatedProduct} />
						))}
					</div>
				</div>
			)}
		</div>
	);
};

// Loading skeleton component
const ProductDetailSkeleton = () => {
	return (
		<div className="space-y-6">
			<Skeleton className="h-4 w-96" />
			<Skeleton className="h-6 w-32" />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Image skeleton */}
				<div className="space-y-4">
					<Skeleton className="aspect-square w-full" />
					<div className="grid grid-cols-4 gap-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="aspect-square" />
						))}
					</div>
				</div>

				{/* Content skeleton */}
				<div className="space-y-6">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-8 w-3/4" />
					<Skeleton className="h-8 w-32" />
					<Skeleton className="h-6 w-20" />
					<div className="space-y-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-3/4" />
					</div>
					<Skeleton className="h-12 w-full" />
				</div>
			</div>
		</div>
	);
};
