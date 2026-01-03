import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { createProduct, updateProduct } from "../api/products";
import { toast } from "react-toastify";

const ProductModal = ({ isOpen, onClose, productToEdit, queryClient }) => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [priceAmount, setPriceAmount] = useState("");
	const [currency, setCurrency] = useState("usd");
	const [billingInterval, setBillingInterval] = useState("one_time");
	const [bannerImages, setBannerImages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Initialize form when productToEdit changes
	useEffect(() => {
		if (productToEdit) {
			setName(productToEdit.name || "");
			setDescription(productToEdit.description || "");
			// Extract price from prices array
			if (productToEdit.prices && productToEdit.prices.length > 0) {
				const price = productToEdit.prices[0];
				const amount = price.price_amount
					? price.price_amount / 100
					: price.amount || price.price || 0;
				setPriceAmount(amount.toString());
				setCurrency(
					price.price_currency || price.currency || "usd"
				);
				setBillingInterval(
					price.recurring_interval || price.interval || "one_time"
				);
			}
			// Load banner images
			const images =
				productToEdit.banner_images || productToEdit.bannerImages || [];
			setBannerImages(images);
		} else {
			// Reset form for new product
			setName("");
			setDescription("");
			setPriceAmount("");
			setCurrency("usd");
			setBillingInterval("one_time");
			setBannerImages([]);
		}
	}, [productToEdit, isOpen]);

	const createProductMutation = useMutation({
		mutationFn: (productData) => createProduct(productData),
		onSuccess: () => {
			toast.success("Product created successfully");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			onClose();
		},
		onError: (error) => {
			console.error("Error creating product:", error);
			toast.error(
				error.message || "Failed to create product. Please try again."
			);
		},
	});

	const updateProductMutation = useMutation({
		mutationFn: ({ productId, productData }) =>
			updateProduct(productId, productData),
		onSuccess: () => {
			toast.success("Product updated successfully");
			queryClient.invalidateQueries({ queryKey: ["products"] });
			onClose();
		},
		onError: (error) => {
			console.error("Error updating product:", error);
			toast.error(
				error.message || "Failed to update product. Please try again."
			);
		},
	});

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		if (files.length === 0) return;

		files.forEach((file) => {
			if (!file.type.startsWith("image/")) {
				toast.error(`${file.name} is not an image file`);
				return;
			}

			const reader = new FileReader();
			reader.onload = (event) => {
				const base64String = event.target.result;
				// Remove data URL prefix (e.g., "data:image/png;base64,")
				const base64Data = base64String.split(",")[1];

				const imageData = {
					base64: base64Data,
					fileName: file.name,
					previewUrl: base64String, // For preview
				};

				setBannerImages((prev) => [...prev, imageData]);
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index) => {
		setBannerImages((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			// Validate required fields
			if (!name.trim()) {
				toast.error("Product name is required");
				setIsLoading(false);
				return;
			}

			if (!priceAmount || parseFloat(priceAmount) <= 0) {
				toast.error("Valid price amount is required");
				setIsLoading(false);
				return;
			}

			// Build price object
			const priceObj = {
				price_amount: Math.round(parseFloat(priceAmount) * 100), // Convert to cents
				price_currency: currency.toLowerCase(),
				amount_type: "fixed",
			};

			// Only include recurring_interval for new products (Polar doesn't allow changing it on update)
			if (!productToEdit) {
				priceObj.recurring_interval = billingInterval;
			}

			const productData = {
				name: name.trim(),
				description: description.trim(),
				prices: [priceObj],
				bannerImages: bannerImages,
			};

			if (productToEdit) {
				await updateProductMutation.mutateAsync({
					productId: productToEdit.id,
					productData,
				});
			} else {
				await createProductMutation.mutateAsync(productData);
			}
		} catch (error) {
			console.error("Error saving product:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={onClose}
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-6 border-b border-zinc-200">
							<h3 className="text-xl font-bold text-zinc-900">
								{productToEdit ? "Edit Product" : "Create New Product"}
							</h3>
							<button
								onClick={onClose}
								className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors rounded-xl hover:bg-zinc-100"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Body */}
						<div className="flex-1 overflow-y-auto p-6">
							{productToEdit && (
								<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
									<div className="flex items-start gap-2">
										<Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
										<div className="text-xs text-yellow-800">
											<p className="font-semibold mb-1">
												Editing Restrictions
											</p>
											<p>
												Billing interval and currency cannot be changed after
												product creation. Only name, description, and prices can
												be updated.
											</p>
										</div>
									</div>
								</div>
							)}

							<form onSubmit={handleSave} className="space-y-4">
								{/* Product Name */}
								<div>
									<label className="block text-sm font-semibold text-zinc-700 mb-2">
										Product Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder="Enter product name"
										className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm"
										required
									/>
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm font-semibold text-zinc-700 mb-2">
										Description
									</label>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Enter product description"
										rows={4}
										className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm resize-none"
									/>
								</div>

								{/* Price and Currency */}
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-semibold text-zinc-700 mb-2">
											Price Amount <span className="text-red-500">*</span>
										</label>
										<input
											type="number"
											step="0.01"
											min="0"
											value={priceAmount}
											onChange={(e) => setPriceAmount(e.target.value)}
											placeholder="0.00"
											className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-semibold text-zinc-700 mb-2">
											Currency
										</label>
										<select
											value={currency}
											onChange={(e) => setCurrency(e.target.value)}
											disabled={!!productToEdit}
											className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
										>
											<option value="usd">USD</option>
											<option value="eur">EUR</option>
											<option value="gbp">GBP</option>
											<option value="cad">CAD</option>
											<option value="aud">AUD</option>
										</select>
										{productToEdit && (
											<p className="text-xs text-zinc-500 mt-1">
												Currency cannot be changed
											</p>
										)}
									</div>
								</div>

								{/* Billing Interval */}
								<div>
									<label className="block text-sm font-semibold text-zinc-700 mb-2">
										Billing Interval
									</label>
									<select
										value={billingInterval}
										onChange={(e) => setBillingInterval(e.target.value)}
										disabled={!!productToEdit}
										className="w-full px-4 py-2.5 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
									>
										<option value="one_time">One-time</option>
										<option value="month">Monthly</option>
										<option value="year">Yearly</option>
									</select>
									{productToEdit && (
										<p className="text-xs text-zinc-500 mt-1">
											Billing interval cannot be changed
										</p>
									)}
								</div>

								{/* Banner Images */}
								<div>
									<label className="block text-sm font-semibold text-zinc-700 mb-2">
										Banner Images
									</label>
									<div className="space-y-3">
										{/* Image Upload Button */}
										<label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-zinc-400 transition-colors">
											<Upload className="w-4 h-4 text-zinc-500" />
											<span className="text-sm text-zinc-600">
												Upload Images
											</span>
											<input
												type="file"
												accept="image/*"
												multiple
												onChange={handleImageUpload}
												className="hidden"
											/>
										</label>

										{/* Image Previews */}
										{bannerImages.length > 0 && (
											<div className="grid grid-cols-3 gap-3">
												{bannerImages.map((img, index) => (
													<div
														key={index}
														className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100"
													>
														<img
															src={img.previewUrl || img.base64 || img.url}
															alt={`Banner ${index + 1}`}
															className="w-full h-full object-cover"
														/>
														<button
															type="button"
															onClick={() => removeImage(index)}
															className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
														>
															<X className="w-3 h-3" />
														</button>
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</form>
						</div>

						{/* Footer */}
						<div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 bg-zinc-50">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 rounded-xl transition-colors"
							>
								Cancel
							</button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								type="button"
								onClick={handleSave}
								disabled={isLoading}
								className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{isLoading
									? "Saving..."
									: productToEdit
										? "Update Product"
										: "Create Product"}
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ProductModal;

