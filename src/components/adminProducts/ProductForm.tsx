import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ImageIcon, Plus, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	type CreateProductInput,
	useProductForm,
} from "./hooks/useProductForm";

interface ProductFormProps {
	productId?: string; // If provided, it's edit mode
	mode: "create" | "edit";
}

export function ProductForm({ productId, mode }: ProductFormProps) {
	const navigate = useNavigate();
	const {
		categories,
		isLoadingCategories,
		createProduct,
		isCreating,
		product,
		updateProduct,
		isUpdating,
		isLoadingProduct,
	} = useProductForm(productId);

	// Form state
	const [formData, setFormData] = useState<CreateProductInput>({
		name: "",
		description: "",
		detailedDescription: "",
		price: 0,
		originalPrice: undefined,
		discount: undefined,
		images: [],
		categoryId: "",
		inStock: true,
		stockCount: 0,
	});

	// Image input state
	const [imageInput, setImageInput] = useState("");

	// Auto-calculate discount when prices change
	useEffect(() => {
		if (
			formData.originalPrice &&
			formData.price &&
			formData.originalPrice > formData.price
		) {
			const calculatedDiscount = Math.round(
				((formData.originalPrice - formData.price) / formData.originalPrice) *
					100,
			);
			setFormData((prev) => ({ ...prev, discount: calculatedDiscount }));
		} else {
			setFormData((prev) => ({ ...prev, discount: undefined }));
		}
	}, [formData.price, formData.originalPrice]);

	useEffect(() => {
		if (mode === "edit" && product) {
			setFormData({
				name: product.name,
				description: product.description,
				detailedDescription: product.detailedDescription || "",
				price: product.price,
				originalPrice: product.originalPrice,
				discount: product.discount,
				images: product.images,
				categoryId: product.category.id,
				inStock: product.inStock,
				stockCount: product.stockCount,
			});
		}
	}, [mode, product]);

	// Handle input changes
	const handleChange = (field: keyof CreateProductInput, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	// Add image URL
	const handleAddImage = () => {
		if (imageInput.trim()) {
			setFormData((prev) => ({
				...prev,
				images: [...prev.images, imageInput.trim()],
			}));
			setImageInput("");
		}
	};

	// Remove image
	const handleRemoveImage = (index: number) => {
		setFormData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	// Handle form submission
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (mode === "edit" && productId) {
			updateProduct(
				{ ...formData, id: productId },
				{
					onSuccess: () => {
						navigate({ to: "/admin/products" });
					},
				},
			);
		} else {
			createProduct(formData, {
				onSuccess: () => {
					navigate({ to: "/admin/products" });
				},
			});
		}
	};

	if (mode === "edit" && isLoadingProduct) {
		return (
			<div className="flex justify-center items-center h-64">
				<p className="text-muted-foreground">Loading product data...</p>
			</div>
		);
	}

	const isSubmitting = mode === "create" ? isCreating : isUpdating;
	const submitButtonText = isSubmitting
		? mode === "create"
			? "Creating..."
			: "Updating..."
		: mode === "create"
			? "Create Product"
			: "Update Product";

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => navigate({ to: "/admin/products" })}
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold">
							{mode === "create" ? "Create New Product" : "Edit Product"}
						</h1>
						<p className="text-muted-foreground">
							{mode === "create"
								? "Add a new product to your inventory"
								: "Update product information"}
						</p>
					</div>
				</div>
				<Button type="submit" disabled={isSubmitting}>
					<Save className="mr-2 h-4 w-4" />
					{submitButtonText}
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Basic Information Card */}
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>
								Enter the basic details about your product
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Product Name */}
							<div className="space-y-2">
								<Label htmlFor="name">Product Name *</Label>
								<Input
									placeholder="e.g., Premium Dog Food"
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									required
								/>
							</div>

							{/* Short Description */}
							<div className="space-y-2">
								<Label htmlFor="description">Short Description *</Label>
								<Textarea
									placeholder="Brief description of the product (1-2 sentences)"
									value={formData.description}
									onChange={(e) => handleChange("description", e.target.value)}
									rows={3}
									required
								/>
							</div>

							{/* Detailed Description */}
							<div className="space-y-2">
								<Label htmlFor="detailedDescription">
									Detailed Description
								</Label>
								<Textarea
									placeholder="Detailed product information, features, specifications..."
									value={formData.detailedDescription || ""}
									onChange={(e) =>
										handleChange("detailedDescription", e.target.value)
									}
									rows={6}
								/>
							</div>

							{/* Category */}
							<div className="space-y-2">
								<Label htmlFor="category">Category *</Label>
								<Select
									value={formData.categoryId}
									onValueChange={(value) => handleChange("categoryId", value)}
									required
								>
									<SelectTrigger>
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
									<SelectContent>
										{isLoadingCategories ? (
											<SelectItem value="loading" disabled>
												Loading categories...
											</SelectItem>
										) : (
											categories?.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Pricing Card */}
					<Card>
						<CardHeader>
							<CardTitle>Pricing</CardTitle>
							<CardDescription>
								Set the pricing details for this product
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Current Price */}
								<div className="space-y-2">
									<Label htmlFor="price">Current Price * ($)</Label>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.price || ""}
										onChange={(e) =>
											handleChange("price", parseFloat(e.target.value) || 0)
										}
										required
									/>
								</div>

								{/* Original Price */}
								<div className="space-y-2">
									<Label htmlFor="originalPrice">Original Price ($)</Label>
									<Input
										type="number"
										step="0.01"
										min="0"
										placeholder="0.00"
										value={formData.originalPrice || ""}
										onChange={(e) =>
											handleChange(
												"originalPrice",
												parseFloat(e.target.value) || undefined,
											)
										}
									/>
									<p className="text-xs text-muted-foreground">
										Leave empty if no discount
									</p>
								</div>
							</div>

							{/* Discount Display */}
							{formData.discount && (
								<div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-green-900 dark:text-green-100">
												Discount Applied
											</p>
											<p className="text-xs text-green-700 dark:text-green-300">
												Customers save $
												{(formData.originalPrice! - formData.price).toFixed(2)}
											</p>
										</div>
										<Badge className="bg-green-600 text-white">
											{formData.discount}% OFF
										</Badge>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Product Images Card */}
					<Card>
						<CardHeader>
							<CardTitle>Product Images</CardTitle>
							<CardDescription>Add image URLs for your product</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Add Image Input */}
							<div className="flex gap-2">
								<Input
									placeholder="Enter image URL"
									value={imageInput}
									onChange={(e) => setImageInput(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddImage();
										}
									}}
								/>
								<Button
									type="button"
									onClick={handleAddImage}
									variant="outline"
								>
									<Plus className="h-4 w-4 mr-2" />
									Add
								</Button>
							</div>

							{/* Image Preview Grid */}
							{formData.images.length > 0 ? (
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									{formData.images.map((image, index) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={index}
											className="relative group border rounded-lg overflow-hidden aspect-square"
										>
											<img
												src={image}
												alt={`Product ${index + 1}`}
												className="w-full h-full object-cover"
											/>
											{index === 0 && (
												<Badge className="absolute top-2 left-2 bg-primary">
													Primary
												</Badge>
											)}
											<Button
												type="button"
												variant="destructive"
												size="icon"
												className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
												onClick={() => handleRemoveImage(index)}
											>
												<X className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="border-2 border-dashed rounded-lg p-12 text-center">
									<ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
									<p className="mt-2 text-sm text-muted-foreground">
										No images added yet
									</p>
									<p className="text-xs text-muted-foreground">
										Add at least one image to showcase your product
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Sidebar */}
				<div className="space-y-6">
					{/* Stock Management Card */}
					<Card>
						<CardHeader>
							<CardTitle>Inventory</CardTitle>
							<CardDescription>Manage stock availability</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* In Stock Toggle */}
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="inStock">In Stock</Label>
									<p className="text-xs text-muted-foreground">
										Product is available for purchase
									</p>
								</div>
								<Switch
									checked={formData.inStock}
									onCheckedChange={(checked) =>
										handleChange("inStock", checked)
									}
								/>
							</div>

							{/* Stock Count */}
							<div className="space-y-2">
								<Label htmlFor="stockCount">Stock Count *</Label>
								<Input
									type="number"
									min="0"
									placeholder="0"
									value={formData.stockCount || ""}
									onChange={(e) =>
										handleChange("stockCount", parseInt(e.target.value) || 0)
									}
									required
								/>
								{formData.stockCount < 10 && formData.stockCount > 0 && (
									<p className="text-xs text-amber-600">⚠️ Low stock warning</p>
								)}
							</div>

							{/* Stock Status Preview */}
							<div className="pt-4 border-t">
								<p className="text-sm font-medium mb-2">Status Preview</p>
								<Badge
									variant={formData.inStock ? "default" : "destructive"}
									className={formData.inStock ? "bg-green-500" : ""}
								>
									{formData.inStock ? "In Stock" : "Out of Stock"}
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Product Summary Card */}
					<Card>
						<CardHeader>
							<CardTitle>Summary</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Category</span>
								<span className="font-medium">
									{formData.categoryId
										? categories?.find((c) => c.id === formData.categoryId)
												?.name
										: "Not selected"}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Price</span>
								<span className="font-medium">
									${formData.price.toFixed(2)}
								</span>
							</div>
							{formData.discount && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Discount</span>
									<span className="font-medium text-green-600">
										{formData.discount}% OFF
									</span>
								</div>
							)}
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Images</span>
								<span className="font-medium">{formData.images.length}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Stock</span>
								<span className="font-medium">{formData.stockCount} units</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</form>
	);
}
