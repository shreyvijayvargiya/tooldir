import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AnimatedDropdown from "./AnimatedDropdown";
import { getAllUsers } from "../api/users";
import { createInvoice, updateInvoice } from "../api/invoice";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const CreateInvoiceModal = ({ isOpen, onClose, invoiceToEdit = null }) => {
	const [selectedClientType, setSelectedClientType] = useState("users");
	const [isClientTypeDropdownOpen, setIsClientTypeDropdownOpen] =
		useState(false);
	const [selectedClient, setSelectedClient] = useState(null);
	const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
	const [useCustomEmail, setUseCustomEmail] = useState(false);
	const [fromDetails, setFromDetails] = useState({
		name: "",
		email: "",
		address: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});
	const [toDetails, setToDetails] = useState({
		name: "",
		email: "",
		address: "",
		city: "",
		state: "",
		zip: "",
		country: "",
	});
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [invoiceDate, setInvoiceDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [dueDate, setDueDate] = useState("");
	const [items, setItems] = useState([
		{ description: "", quantity: 1, price: 0, total: 0 },
	]);
	const [notes, setNotes] = useState("");
	const [signature, setSignature] = useState("");
	const [status, setStatus] = useState("unpaid");
	const [isSaving, setIsSaving] = useState(false);

	// Fetch users
	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: getAllUsers,
	});

	// Prepare client options based on selected type
	const getClientOptions = () => {
		return users.map((user) => ({
			value: user.id,
			label: `${user.name || user.displayName || user.email} (${user.email || "N/A"})`,
			data: user,
		}));
	};

	// Handle client selection
	const handleClientSelect = (clientId) => {
		const options = getClientOptions();
		const selected = options.find((opt) => opt.value === clientId);
		if (selected) {
			setSelectedClient(selected.value);
			const clientData = selected.data;
			setToDetails({
				name: clientData.name || clientData.displayName || "",
				email: clientData.email || "",
				address: clientData.address || "",
				city: clientData.city || "",
				state: clientData.state || "",
				zip: clientData.zip || "",
				country: clientData.country || "",
			});
		}
	};

	// Calculate total for an item
	const calculateItemTotal = (item) => {
		return (item.quantity || 0) * (item.price || 0);
	};

	// Calculate grand total
	const calculateGrandTotal = () => {
		return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
	};

	// Update item total when quantity or price changes
	const updateItem = (index, field, value) => {
		const newItems = [...items];
		newItems[index] = {
			...newItems[index],
			[field]:
				field === "quantity" || field === "price"
					? parseFloat(value) || 0
					: value,
		};
		newItems[index].total = calculateItemTotal(newItems[index]);
		setItems(newItems);
	};

	// Add new row
	const addRow = () => {
		setItems([...items, { description: "", quantity: 1, price: 0, total: 0 }]);
	};

	// Remove row
	const removeRow = (index) => {
		if (items.length > 1) {
			setItems(items.filter((_, i) => i !== index));
		}
	};

	// Load invoice data if editing
	useEffect(() => {
		if (invoiceToEdit) {
			setInvoiceNumber(invoiceToEdit.invoiceNumber || "");

			// Handle invoice date
			let invoiceDateValue = new Date().toISOString().split("T")[0];
			if (invoiceToEdit.invoiceDate) {
				if (
					invoiceToEdit.invoiceDate.toDate &&
					typeof invoiceToEdit.invoiceDate.toDate === "function"
				) {
					invoiceDateValue = invoiceToEdit.invoiceDate
						.toDate()
						.toISOString()
						.split("T")[0];
				} else if (invoiceToEdit.invoiceDate instanceof Date) {
					invoiceDateValue = invoiceToEdit.invoiceDate
						.toISOString()
						.split("T")[0];
				} else {
					try {
						invoiceDateValue = new Date(invoiceToEdit.invoiceDate)
							.toISOString()
							.split("T")[0];
					} catch (e) {
						console.error("Error parsing invoice date:", e);
					}
				}
			}
			setInvoiceDate(invoiceDateValue);

			// Handle due date
			let dueDateValue = "";
			if (invoiceToEdit.dueDate) {
				if (
					invoiceToEdit.dueDate.toDate &&
					typeof invoiceToEdit.dueDate.toDate === "function"
				) {
					dueDateValue = invoiceToEdit.dueDate
						.toDate()
						.toISOString()
						.split("T")[0];
				} else if (invoiceToEdit.dueDate instanceof Date) {
					dueDateValue = invoiceToEdit.dueDate.toISOString().split("T")[0];
				} else {
					try {
						dueDateValue = new Date(invoiceToEdit.dueDate)
							.toISOString()
							.split("T")[0];
					} catch (e) {
						console.error("Error parsing due date:", e);
					}
				}
			}
			setDueDate(dueDateValue);

			setFromDetails(
				invoiceToEdit.from || {
					name: "",
					email: "",
					address: "",
					city: "",
					state: "",
					zip: "",
					country: "",
				}
			);
			setToDetails(
				invoiceToEdit.to || {
					name: "",
					email: "",
					address: "",
					city: "",
					state: "",
					zip: "",
					country: "",
				}
			);
			setItems(
				invoiceToEdit.items && invoiceToEdit.items.length > 0
					? invoiceToEdit.items
					: [{ description: "", quantity: 1, price: 0, total: 0 }]
			);
			setNotes(invoiceToEdit.notes || "");
			setSignature(invoiceToEdit.signature || "");
			setStatus(invoiceToEdit.status || "unpaid");
			setSelectedClientType(invoiceToEdit.clientType || "users");
			setSelectedClient(invoiceToEdit.clientId || null);
		}
	}, [invoiceToEdit]);

	// Reset form when modal closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedClientType("users");
			setSelectedClient(null);
			setUseCustomEmail(false);
			setFromDetails({
				name: "",
				email: "",
				address: "",
				city: "",
				state: "",
				zip: "",
				country: "",
			});
			setToDetails({
				name: "",
				email: "",
				address: "",
				city: "",
				state: "",
				zip: "",
				country: "",
			});
			setInvoiceNumber("");
			setInvoiceDate(new Date().toISOString().split("T")[0]);
			setDueDate("");
			setItems([{ description: "", quantity: 1, price: 0, total: 0 }]);
			setNotes("");
			setSignature("");
			setStatus("unpaid");
		}
	}, [isOpen]);

	// Handle save
	const handleSave = async () => {
		if (!invoiceNumber.trim()) {
			toast.error("Please enter an invoice number");
			return;
		}

		if (!toDetails.name || !toDetails.email) {
			toast.error("Please select a client or fill in 'To' details");
			return;
		}

		if (items.some((item) => !item.description.trim())) {
			toast.error("Please fill in all item descriptions");
			return;
		}

		setIsSaving(true);
		try {
			const invoiceData = {
				invoiceNumber,
				invoiceDate: new Date(invoiceDate),
				dueDate: dueDate ? new Date(dueDate) : null,
				from: fromDetails,
				to: toDetails,
				items: items.map((item) => ({
					...item,
					total: calculateItemTotal(item),
				})),
				total: calculateGrandTotal(),
				notes,
				signature,
				status,
				clientType: selectedClientType,
				clientId: selectedClient,
			};

			if (invoiceToEdit) {
				await updateInvoice(invoiceToEdit.id, invoiceData);
				toast.success("Invoice updated successfully");
			} else {
				await createInvoice(invoiceData);
				toast.success("Invoice created successfully");
			}

			onClose();
		} catch (error) {
			console.error("Error saving invoice:", error);
			toast.error("Failed to save invoice. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const clientTypeOptions = [{ value: "users", label: "Users" }];

	const selectClassName =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
				<DialogHeader className="p-4 border-b border-border">
					<DialogTitle>
						{invoiceToEdit ? "Edit Invoice" : "Create New Invoice"}
					</DialogTitle>
				</DialogHeader>

				<div className="p-6 overflow-y-auto flex-1">
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="useCustomEmail"
									checked={useCustomEmail}
									onChange={(e) => {
										setUseCustomEmail(e.target.checked);
										if (e.target.checked) {
											setSelectedClient(null);
											setToDetails({
												name: "",
												email: "",
												address: "",
												city: "",
												state: "",
												zip: "",
												country: "",
											});
										}
									}}
									className="w-4 h-4 rounded border-input"
								/>
								<Label htmlFor="useCustomEmail" className="cursor-pointer">
									Use custom email instead of selecting from list
								</Label>
							</div>
							{!useCustomEmail ? (
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>Client Type</Label>
										<AnimatedDropdown
											isOpen={isClientTypeDropdownOpen}
											onToggle={() =>
												setIsClientTypeDropdownOpen(
													!isClientTypeDropdownOpen
												)
											}
											onSelect={(value) => {
												setSelectedClientType(value);
												setSelectedClient(null);
												setToDetails({
													name: "",
													email: "",
													address: "",
													city: "",
													state: "",
													zip: "",
													country: "",
												});
												setIsClientTypeDropdownOpen(false);
											}}
											options={clientTypeOptions}
											value={selectedClientType}
											placeholder="Select client type"
										/>
									</div>
									<div className="space-y-2">
										<Label>Select Client</Label>
										<AnimatedDropdown
											isOpen={isClientDropdownOpen}
											onToggle={() =>
												setIsClientDropdownOpen(!isClientDropdownOpen)
											}
											onSelect={handleClientSelect}
											options={getClientOptions()}
											value={selectedClient}
											placeholder="Select a client"
										/>
									</div>
								</div>
							) : null}
						</div>

						<div className="grid grid-cols-3 gap-4">
							<div className="space-y-2">
								<Label htmlFor="invoice-number">Invoice Number *</Label>
								<Input
									id="invoice-number"
									type="text"
									value={invoiceNumber}
									onChange={(e) => setInvoiceNumber(e.target.value)}
									placeholder="INV-001"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="invoice-date">Invoice Date</Label>
								<Input
									id="invoice-date"
									type="date"
									value={invoiceDate}
									onChange={(e) => setInvoiceDate(e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="due-date">Due Date</Label>
								<Input
									id="due-date"
									type="date"
									value={dueDate}
									onChange={(e) => setDueDate(e.target.value)}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-6">
							<Card>
								<CardContent className="p-4 space-y-3">
									<h4 className="text-sm font-semibold text-foreground">From</h4>
									<Input
										type="text"
										placeholder="Company Name"
										value={fromDetails.name}
										onChange={(e) =>
											setFromDetails({
												...fromDetails,
												name: e.target.value,
											})
										}
									/>
									<Input
										type="email"
										placeholder="Email"
										value={fromDetails.email}
										onChange={(e) =>
											setFromDetails({
												...fromDetails,
												email: e.target.value,
											})
										}
									/>
									<Input
										type="text"
										placeholder="Address"
										value={fromDetails.address}
										onChange={(e) =>
											setFromDetails({
												...fromDetails,
												address: e.target.value,
											})
										}
									/>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="text"
											placeholder="City"
											value={fromDetails.city}
											onChange={(e) =>
												setFromDetails({
													...fromDetails,
													city: e.target.value,
												})
											}
										/>
										<Input
											type="text"
											placeholder="State"
											value={fromDetails.state}
											onChange={(e) =>
												setFromDetails({
													...fromDetails,
													state: e.target.value,
												})
											}
										/>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="text"
											placeholder="ZIP"
											value={fromDetails.zip}
											onChange={(e) =>
												setFromDetails({
													...fromDetails,
													zip: e.target.value,
												})
											}
										/>
										<Input
											type="text"
											placeholder="Country"
											value={fromDetails.country}
											onChange={(e) =>
												setFromDetails({
													...fromDetails,
													country: e.target.value,
												})
											}
										/>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4 space-y-3">
									<h4 className="text-sm font-semibold text-foreground">To</h4>
									<Input
										type="text"
										placeholder="Client Name *"
										value={toDetails.name}
										onChange={(e) =>
											setToDetails({ ...toDetails, name: e.target.value })
										}
									/>
									<Input
										type="email"
										placeholder="Email *"
										value={toDetails.email}
										onChange={(e) =>
											setToDetails({ ...toDetails, email: e.target.value })
										}
									/>
									<Input
										type="text"
										placeholder="Address"
										value={toDetails.address}
										onChange={(e) =>
											setToDetails({
												...toDetails,
												address: e.target.value,
											})
										}
									/>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="text"
											placeholder="City"
											value={toDetails.city}
											onChange={(e) =>
												setToDetails({ ...toDetails, city: e.target.value })
											}
										/>
										<Input
											type="text"
											placeholder="State"
											value={toDetails.state}
											onChange={(e) =>
												setToDetails({
													...toDetails,
													state: e.target.value,
												})
											}
										/>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<Input
											type="text"
											placeholder="ZIP"
											value={toDetails.zip}
											onChange={(e) =>
												setToDetails({ ...toDetails, zip: e.target.value })
											}
										/>
										<Input
											type="text"
											placeholder="Country"
											value={toDetails.country}
											onChange={(e) =>
												setToDetails({
													...toDetails,
													country: e.target.value,
												})
											}
										/>
									</div>
								</CardContent>
							</Card>
						</div>

						<Card className="overflow-hidden">
							<div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
								<h4 className="text-sm font-semibold text-foreground">Items</h4>
								<Button variant="outline" size="sm" onClick={addRow}>
									<Plus className="w-3.5 h-3.5" />
									Add Row
								</Button>
							</div>
							<table className="w-full">
								<thead className="bg-muted border-b border-border">
									<tr>
										<th className="py-2 px-4 text-left text-xs font-semibold text-muted-foreground">
											Description
										</th>
										<th className="py-2 px-4 text-left text-xs font-semibold text-muted-foreground">
											Quantity
										</th>
										<th className="py-2 px-4 text-left text-xs font-semibold text-muted-foreground">
											Price
										</th>
										<th className="py-2 px-4 text-left text-xs font-semibold text-muted-foreground">
											Total
										</th>
										<th className="py-2 px-4 text-center text-xs font-semibold text-muted-foreground">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{items.map((item, index) => (
										<tr
											key={index}
											className={
												index !== items.length - 1
													? "border-b border-border"
													: ""
											}
										>
											<td className="py-2 px-4">
												<Input
													type="text"
													value={item.description}
													onChange={(e) =>
														updateItem(index, "description", e.target.value)
													}
													placeholder="Item description"
													className="h-8"
												/>
											</td>
											<td className="py-2 px-4">
												<Input
													type="number"
													min="0"
													step="1"
													value={item.quantity}
													onChange={(e) =>
														updateItem(index, "quantity", e.target.value)
													}
													className="h-8"
												/>
											</td>
											<td className="py-2 px-4">
												<Input
													type="number"
													min="0"
													step="0.01"
													value={item.price}
													onChange={(e) =>
														updateItem(index, "price", e.target.value)
													}
													className="h-8"
												/>
											</td>
											<td className="py-2 px-4">
												<span className="text-sm font-medium text-foreground">
													${calculateItemTotal(item).toFixed(2)}
												</span>
											</td>
											<td className="py-2 px-4 text-center">
												{items.length > 1 && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => removeRow(index)}
														className="h-8 w-8 text-destructive hover:text-destructive"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												)}
											</td>
										</tr>
									))}
								</tbody>
								<tfoot className="bg-muted border-t-2 border-border">
									<tr>
										<td
											colSpan={3}
											className="py-3 px-4 text-sm font-semibold text-foreground text-right"
										>
											Grand Total:
										</td>
										<td className="py-3 px-4 text-sm font-bold text-foreground">
											${calculateGrandTotal().toFixed(2)}
										</td>
										<td></td>
									</tr>
								</tfoot>
							</table>
						</Card>

						<div className="space-y-2">
							<Label htmlFor="invoice-notes">Notes</Label>
							<Textarea
								id="invoice-notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
								placeholder="Additional notes or terms..."
							/>
						</div>

						<div className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="invoice-signature">Signature</Label>
								<Input
									id="invoice-signature"
									type="text"
									value={signature}
									onChange={(e) => setSignature(e.target.value)}
									placeholder="Your signature"
								/>
							</div>
							<div className="text-center text-sm text-muted-foreground space-y-1">
								<p>Cheers!</p>
								<p>Thank you for your business!</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="invoice-status">Status</Label>
							<select
								id="invoice-status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className={selectClassName}
							>
								<option value="unpaid">Unpaid</option>
								<option value="paid">Paid</option>
							</select>
						</div>
					</div>
				</div>

				<DialogFooter className="p-4 border-t border-border bg-muted/50 gap-2 sm:gap-0">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						<Save className="w-4 h-4" />
						{isSaving
							? "Saving..."
							: invoiceToEdit
								? "Update Invoice"
								: "Save Invoice"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateInvoiceModal;
