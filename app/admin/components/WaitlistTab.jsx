import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Calendar,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	Trash2,
	Send,
	Mail,
	Plus,
	X,
	Save,
} from "lucide-react";
import {
	getAllWaitlist,
	deleteWaitlistEntry,
	addWaitlistEntry,
} from "../../../lib/api/waitlist";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import ConfirmationModal from "../../../lib/ui/ConfirmationModal";
import ExportDropdown from "../../../lib/ui/ExportDropdown";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	TableEmpty,
} from "../../../lib/ui/Table";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WaitlistTab = ({ queryClient }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [sortField, setSortField] = useState(null); // 'name', 'email', 'createdAt'
	const [sortDirection, setSortDirection] = useState("asc"); // 'asc' or 'desc'
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [entryToDelete, setEntryToDelete] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newEntry, setNewEntry] = useState({
		name: "",
		email: "",
	});
	const [showSendMessageModal, setShowSendMessageModal] = useState(false);
	const [selectedEntry, setSelectedEntry] = useState(null);
	const [messageForm, setMessageForm] = useState({
		subject: "",
		content: "",
	});
	const [isSendingMessage, setIsSendingMessage] = useState(false);

	const {
		data: waitlist = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["waitlist"],
		queryFn: () => getAllWaitlist(),
	});

	const filteredWaitlist = waitlist.filter((entry) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			entry.name?.toLowerCase().includes(searchLower) ||
			entry.email?.toLowerCase().includes(searchLower)
		);
	});

	// Sort waitlist
	const sortedWaitlist = [...filteredWaitlist].sort((a, b) => {
		if (!sortField) return 0;

		// Handle date comparison
		if (sortField === "createdAt") {
			const dateA = a.createdAt?.toDate
				? a.createdAt.toDate()
				: new Date(a.createdAt || 0);
			const dateB = b.createdAt?.toDate
				? b.createdAt.toDate()
				: new Date(b.createdAt || 0);
			return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
		}

		// Handle string comparison for other fields
		let aValue, bValue;

		switch (sortField) {
			case "name":
				aValue = (a.name || "").toLowerCase();
				bValue = (b.name || "").toLowerCase();
				break;
			case "email":
				aValue = (a.email || "").toLowerCase();
				bValue = (b.email || "").toLowerCase();
				break;
			default:
				return 0;
		}

		// String comparison
		if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
		if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
		return 0;
	});

	// Handle column sort
	const handleSort = (field) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	// Get sort icon for column header
	const getSortIcon = (field) => {
		if (sortField !== field) {
			return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground" />;
		}
		return sortDirection === "asc" ? (
			<ArrowUp className="w-3.5 h-3.5 ml-1 text-foreground" />
		) : (
			<ArrowDown className="w-3.5 h-3.5 ml-1 text-foreground" />
		);
	};

	const formatDate = (date) => {
		if (!date) return "";
		const d = date?.toDate ? date.toDate() : new Date(date);
		if (isNaN(d.getTime())) return "";
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleDeleteClick = (entry) => {
		setEntryToDelete(entry);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!entryToDelete) return;

		try {
			await deleteWaitlistEntry(entryToDelete.id);
			toast.success("Waitlist entry removed successfully");
			queryClient.invalidateQueries({ queryKey: ["waitlist"] });
		} catch (error) {
			console.error("Error deleting waitlist entry:", error);
			toast.error("Failed to remove waitlist entry. Please try again.");
		} finally {
			setEntryToDelete(null);
			setIsDeleteModalOpen(false);
		}
	};

	const handleSendMessageClick = (entry) => {
		if (!entry.email) {
			toast.error("Email address is missing");
			return;
		}
		setSelectedEntry(entry);
		setMessageForm({
			subject: "",
			content: "",
		});
		setShowSendMessageModal(true);
	};

	const handleCloseSendMessageModal = () => {
		setShowSendMessageModal(false);
		setSelectedEntry(null);
		setMessageForm({
			subject: "",
			content: "",
		});
		setIsSendingMessage(false);
	};

	const handleSendMessage = async () => {
		if (!messageForm.subject.trim()) {
			toast.error("Please enter a subject/title");
			return;
		}

		if (!messageForm.content.trim()) {
			toast.error("Please enter a message");
			return;
		}

		if (!selectedEntry?.email) {
			toast.error("Recipient email is missing");
			return;
		}

		setIsSendingMessage(true);
		try {
			// TODO: Implement email sending API
			const response = await fetch("/api/emails/send-single", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: selectedEntry.email,
					name: selectedEntry.name || undefined,
					subject: messageForm.subject.trim(),
					content: messageForm.content.trim(),
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Message sent successfully!");
				handleCloseSendMessageModal();
			} else {
				toast.error(data.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message. Please try again.");
		} finally {
			setIsSendingMessage(false);
		}
	};

	const addWaitlistMutation = useMutation({
		mutationFn: addWaitlistEntry,
		onSuccess: () => {
			toast.success("Waitlist entry added successfully");
			queryClient.invalidateQueries({ queryKey: ["waitlist"] });
			handleCloseModal();
		},
		onError: (error) => {
			console.error("Error adding waitlist entry:", error);
			toast.error("Failed to add waitlist entry. Please try again.");
		},
	});

	const handleAddWaitlistEntry = () => {
		if (!newEntry.name.trim() || !newEntry.email.trim()) {
			toast.error("Please fill in both name and email");
			return;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(newEntry.email)) {
			toast.error("Please enter a valid email address");
			return;
		}

		addWaitlistMutation.mutate({
			name: newEntry.name.trim(),
			email: newEntry.email.trim().toLowerCase(),
		});
	};

	const handleCloseModal = () => {
		setShowAddModal(false);
		setNewEntry({
			name: "",
			email: "",
		});
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between border-b py-2 px-4">
				<div>
					<h1 className="text-lg text-foreground">Waitlist</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage your waitlist entries
					</p>
				</div>
				<div className="flex items-center gap-2">
					<ExportDropdown
						dataType="waitlist"
						data={sortedWaitlist.map((e) => ({
							...e,
							joinedAt: e.joinedAt || e.createdAt,
						}))}
					/>
					<Button
						onClick={() => setShowAddModal(true)}
						className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
					>
						<Plus className="w-3.5 h-3.5" />
						Add New Member
					</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search waitlist by name or email..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto px-4">
				{isLoading ? (
					<TableSkeleton rows={5} columns={4} />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead sortable onClick={() => handleSort("name")}>
									<div className="flex items-center gap-2">
										Name
										{getSortIcon("name")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("email")}>
									<div className="flex items-center gap-2">
										Email
										{getSortIcon("email")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("createdAt")}>
									<div className="flex items-center gap-2">
										Joined
										{getSortIcon("createdAt")}
									</div>
								</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={4}
									message="Error loading waitlist. Please try again."
								/>
							) : sortedWaitlist.length === 0 ? (
								<TableEmpty
									colSpan={4}
									message={
										searchQuery
											? "No waitlist entries found matching your search."
											: "No waitlist entries yet."
									}
								/>
							) : (
								sortedWaitlist.map((entry) => (
									<TableRow key={entry.id}>
										<TableCell>
											<div className="font-medium text-sm text-foreground">
												{entry.name || ""}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-sm text-muted-foreground flex items-center gap-1">
												<Mail className="w-3 h-3" />
												{entry.email || ""}
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											<div className="text-xs flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(entry.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													onClick={() => handleSendMessageClick(entry)}
													className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors"
													title="Send Message"
												>
													<Send className="w-4 h-4" />
												</Button>
												<Button
													onClick={() => handleDeleteClick(entry)}
													className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
													title="Remove"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Add Waitlist Entry Modal */}
			<AnimatePresence>
				{showAddModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
						onClick={handleCloseModal}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
						>
							{/* Modal Header */}
							<div className="flex items-center justify-between p-4 border-b border">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-full bg-muted text-muted-foreground">
										<Plus className="w-5 h-5" />
									</div>
									<h3 className="text-lg font-bold text-foreground">
										Add Waitlist Member
									</h3>
								</div>
								<button
									onClick={handleCloseModal}
									className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							{/* Modal Body */}
							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Name *
									</label>
									<input
										type="text"
										value={newEntry.name}
										onChange={(e) =>
											setNewEntry({ ...newEntry, name: e.target.value })
										}
										className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
										placeholder="Enter name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Email *
									</label>
									<input
										type="email"
										value={newEntry.email}
										onChange={(e) =>
											setNewEntry({ ...newEntry, email: e.target.value })
										}
										className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
										placeholder="Enter email address"
									/>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="flex items-center justify-end gap-3 p-4 border-t bg-muted">
								<Button
									onClick={handleCloseModal}
									className="px-4 py-2 text-sm text-muted-foreground bg-card hover:bg-muted rounded-xl font-medium transition-colors border border"
								>
									Cancel
								</Button>
								<Button onClick={handleAddWaitlistEntry} disabled={addWaitlistMutation.isPending} className="rounded-xl gap-2 disabled:opacity-50">
									<Save className="w-4 h-4" />
									{addWaitlistMutation.isPending ? "Adding..." : "Add Member"}
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Send Message Modal */}
			<AnimatePresence>
				{showSendMessageModal && selectedEntry && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
						onClick={handleCloseSendMessageModal}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
						>
							{/* Modal Header */}
							<div className="flex items-center justify-between p-4 border-b border">
								<div className="flex items-center gap-3">
									<div className="p-2 rounded-full bg-green-100 text-green-600">
										<Send className="w-5 h-5" />
									</div>
									<div>
										<h3 className="text-lg font-bold text-foreground">
											Send Message
										</h3>
										<p className="text-xs text-muted-foreground">
											To: {selectedEntry.name || "N/A"} ({selectedEntry.email})
										</p>
									</div>
								</div>
								<button
									onClick={handleCloseSendMessageModal}
									className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>

							{/* Modal Body */}
							<div className="flex-1 overflow-y-auto p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Subject / Title *
									</label>
									<input
										type="text"
										value={messageForm.subject}
										onChange={(e) =>
											setMessageForm({
												...messageForm,
												subject: e.target.value,
											})
										}
										className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
										placeholder="Enter message subject"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-muted-foreground mb-2">
										Message *
									</label>
									<textarea
										value={messageForm.content}
										onChange={(e) =>
											setMessageForm({
												...messageForm,
												content: e.target.value,
											})
										}
										rows={8}
										className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
										placeholder="Type your message here..."
									/>
								</div>
							</div>

							{/* Modal Footer */}
							<div className="flex items-center justify-end gap-3 p-4 border-t bg-muted">
								<Button
									onClick={handleCloseSendMessageModal}
									disabled={isSendingMessage}
									className="px-4 py-2 text-sm text-muted-foreground bg-card hover:bg-muted rounded-xl font-medium transition-colors border disabled:opacity-50"
								>
									Cancel
								</Button>
								<Button onClick={handleSendMessage} disabled={isSendingMessage} className="rounded-xl gap-2 disabled:opacity-50">
									<Send className="w-4 h-4" />
									{isSendingMessage ? "Sending..." : "Send Message"}
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Delete Confirmation Modal */}
			<ConfirmationModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setEntryToDelete(null);
				}}
				onConfirm={handleDeleteConfirm}
				title="Remove Waitlist Entry"
				message={
					entryToDelete
						? `Are you sure you want to remove ${entryToDelete.name || entryToDelete.email} from the waitlist? This action cannot be undone.`
						: "Are you sure you want to remove this waitlist entry?"
				}
				confirmText="Remove"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
};

export default WaitlistTab;
