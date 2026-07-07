import React from "react";
import { X, Download, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const InvoiceModal = ({ isOpen, onClose, payment }) => {
	if (!payment) return null;

	const formatDate = (date) => {
		if (!date) return "";

		let d;
		try {
			if (date?.toDate && typeof date.toDate === "function") {
				d = date.toDate();
			} else if (date instanceof Date) {
				d = date;
			} else {
				d = new Date(date);
			}

			if (isNaN(d.getTime())) {
				return "";
			}

			return d.toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch (error) {
			console.error("Error formatting date:", error, date);
			return "";
		}
	};

	const formatCurrency = (amount, currency = "usd") => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency.toUpperCase(),
		}).format(amount / 100);
	};

	const downloadInvoicePDF = () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 20;
		let yPos = margin;

		// Invoice Title
		doc.setFontSize(24);
		doc.setFont("helvetica", "bold");
		doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });
		yPos += 15;

		// Invoice Number
		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		doc.text(
			`Invoice #: ${payment.paymentId || payment.id}`,
			pageWidth - margin,
			yPos,
			{ align: "right" }
		);
		yPos += 8;

		// Date
		doc.text(
			`Date: ${formatDate(payment.createdAt)}`,
			pageWidth - margin,
			yPos,
			{ align: "right" }
		);
		yPos += 20;

		// From Section
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("From:", margin, yPos);
		yPos += 8;
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text("Your Company Name", margin, yPos);
		yPos += 5;
		doc.text("Your Company Address", margin, yPos);
		yPos += 5;
		doc.text("City, State, ZIP", margin, yPos);
		yPos += 15;

		// To Section
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.text("To:", margin, yPos);
		yPos += 8;
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text(payment.customerName || "N/A", margin, yPos);
		yPos += 5;
		doc.text(payment.customerEmail || "N/A", margin, yPos);
		yPos += 15;

		// Line items table header
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("Description", margin, yPos);
		doc.text("Amount", pageWidth - margin, yPos, { align: "right" });
		yPos += 8;

		// Line
		doc.setLineWidth(0.5);
		doc.line(margin, yPos, pageWidth - margin, yPos);
		yPos += 8;

		// Line item
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		const description = `${payment.planName || "Plan"} - ${payment.paymentType === "subscription" ? "Subscription" : "Payment"}`;
		doc.text(description, margin, yPos);
		const amount = payment.amount
			? formatCurrency(payment.amount, payment.currency)
			: formatCurrency(0, payment.currency);
		doc.text(amount, pageWidth - margin, yPos, { align: "right" });
		yPos += 10;

		// Line
		doc.line(margin, yPos, pageWidth - margin, yPos);
		yPos += 10;

		// Total
		doc.setFontSize(12);
		doc.setFont("helvetica", "bold");
		doc.text("Total:", pageWidth - margin - 50, yPos);
		doc.text(amount, pageWidth - margin, yPos, { align: "right" });
		yPos += 15;

		// Status
		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.text(`Status: ${payment.status || ""}`, margin, yPos);
		yPos += 8;

		// Payment ID
		doc.text(`Payment ID: ${payment.paymentId || payment.id}`, margin, yPos);
		yPos += 8;

		// Subscription ID (if available)
		if (payment.subscriptionId) {
			doc.text(`Subscription ID: ${payment.subscriptionId}`, margin, yPos);
		}

		// Footer
		const footerY = pageHeight - 20;
		doc.setFontSize(8);
		doc.setFont("helvetica", "italic");
		doc.text("Thank you for your business!", pageWidth / 2, footerY, {
			align: "center",
		});

		// Save PDF
		const fileName = `invoice-${payment.paymentId || payment.id}.pdf`;
		doc.save(fileName);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl [&>button]:hidden">
				{/* Header */}
				<DialogHeader className="flex-row items-center justify-between space-y-0 border-b border p-4">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-muted p-2 text-muted-foreground">
							<FileText className="h-5 w-5" />
						</div>
						<DialogTitle>Invoice</DialogTitle>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={downloadInvoicePDF}
							className="rounded-xl"
							title="Download PDF"
						>
							<Download className="h-5 w-5" />
						</Button>
						<Button variant="ghost" size="icon" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</DialogHeader>

				{/* Body */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{/* Invoice Header */}
						<div className="flex items-start justify-between border-b border pb-4">
							<div>
								<h2 className="mb-2 text-2xl font-bold text-foreground">INVOICE</h2>
								<p className="text-sm text-muted-foreground">
									Invoice #:{" "}
									<span className="font-mono">
										{payment.paymentId || payment.id}
									</span>
								</p>
								<p className="text-sm text-muted-foreground">
									Date: {formatDate(payment.createdAt)}
								</p>
							</div>
							<div className="text-right">
								<p className="mb-1 text-sm text-muted-foreground">Status</p>
								<span
									className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
										payment.status === "succeeded"
											? "bg-green-100 text-green-800"
											: payment.status === "failed"
												? "bg-red-100 text-red-800"
												: "bg-yellow-100 text-yellow-800"
									}`}
								>
									{payment.status || ""}
								</span>
							</div>
						</div>

						{/* From/To Section */}
						<div className="grid grid-cols-2 gap-6">
							<div>
								<h3 className="mb-2 text-sm font-semibold text-foreground">From</h3>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p>Your Company Name</p>
									<p>Your Company Address</p>
									<p>City, State, ZIP</p>
								</div>
							</div>
							<div>
								<h3 className="mb-2 text-sm font-semibold text-foreground">To</h3>
								<div className="space-y-1 text-sm text-muted-foreground">
									<p className="font-medium text-foreground">
										{payment.customerName || ""}
									</p>
									<p>{payment.customerEmail || ""}</p>
								</div>
							</div>
						</div>

						{/* Items Table */}
						<div className="overflow-hidden rounded-xl border border">
							<table className="w-full">
								<thead className="bg-muted">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
											Description
										</th>
										<th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">
											Amount
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-t border">
										<td className="px-4 py-3 text-sm text-foreground">
											{payment.planName || "Plan"} -{" "}
											{payment.paymentType === "subscription"
												? "Subscription"
												: "Payment"}
										</td>
										<td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
											{payment.amount
												? formatCurrency(payment.amount, payment.currency)
												: "$0"}
										</td>
									</tr>
								</tbody>
								<tfoot className="border-t-2 border bg-muted">
									<tr>
										<td className="px-4 py-3 text-sm font-semibold text-foreground">
											Total
										</td>
										<td className="px-4 py-3 text-right text-sm font-bold text-foreground">
											{payment.amount
												? formatCurrency(payment.amount, payment.currency)
												: "$0"}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>

						{/* Additional Info */}
						<div className="border-t border pt-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p className="mb-1 text-muted-foreground">Payment ID</p>
									<p className="font-mono text-foreground">
										{payment.paymentId || payment.id}
									</p>
								</div>
								{payment.subscriptionId && (
									<div>
										<p className="mb-1 text-muted-foreground">Subscription ID</p>
										<p className="font-mono text-foreground">
											{payment.subscriptionId}
										</p>
									</div>
								)}
								{payment.customerId && (
									<div>
										<p className="mb-1 text-muted-foreground">Customer ID</p>
										<p className="font-mono text-foreground">
											{payment.customerId}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<DialogFooter className="border-t border bg-muted p-4 sm:justify-end">
					<Button onClick={downloadInvoicePDF} className="rounded-xl">
						<Download className="h-4 w-4" />
						Download PDF
					</Button>
					<Button variant="outline" onClick={onClose} className="rounded-xl">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default InvoiceModal;
