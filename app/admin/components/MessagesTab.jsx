import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	Mail,
	Search,
	Calendar,
	Trash2,
	Eye,
	Send,
	X,
	Plus,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import {
	getAllMessages,
	markMessageAsRead,
	deleteMessage,
} from "../../../lib/api/messages";
import { CheckCircle2 } from "lucide-react";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
import AnimatedDropdown from "../../../lib/ui/AnimatedDropdown";
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

const MessagesTab = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [readFilter, setReadFilter] = useState("all"); // all, read, unread
	const [repliedFilter, setRepliedFilter] = useState("all"); // all, replied, unreplied
	const [sortField, setSortField] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");
	const [readFilterDropdownOpen, setReadFilterDropdownOpen] = useState(false);
	const [repliedFilterDropdownOpen, setRepliedFilterDropdownOpen] =
		useState(false);
	const [replyModalOpen, setReplyModalOpen] = useState(false);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [replyForm, setReplyForm] = useState({
		subject: "",
		content: "",
	});
	const [isSendingReply, setIsSendingReply] = useState(false);
	const queryClient = useQueryClient();

	const {
		data: messages = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["messages"],
		queryFn: () => getAllMessages(),
	});

	const markAsReadMutation = useMutation({
		mutationFn: markMessageAsRead,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages"] });
			toast.success("Message marked as read");
		},
		onError: () => {
			toast.error("Failed to mark message as read");
		},
	});

	const deleteMessageMutation = useMutation({
		mutationFn: deleteMessage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages"] });
			toast.success("Message deleted");
		},
		onError: () => {
			toast.error("Failed to delete message");
		},
	});

	const handleReplyClick = (message) => {
		setSelectedMessage(message);
		setReplyForm({
			subject: `Re: ${message.subject}`,
			content: "",
		});
		setReplyModalOpen(true);
	};

	const handleSendReply = async (e) => {
		e.preventDefault();
		if (!selectedMessage) return;

		setIsSendingReply(true);
		try {
			const response = await fetch("/api/messages/reply", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: selectedMessage.email,
					toName: selectedMessage.name || selectedMessage.email,
					subject: replyForm.subject,
					content: replyForm.content,
					originalMessage: selectedMessage.message,
					messageId: selectedMessage.id,
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				toast.success("Reply sent successfully!");
				setReplyModalOpen(false);
				setSelectedMessage(null);
				setReplyForm({ subject: "", content: "" });
				// Mark message as read after replying
				if (!selectedMessage.read) {
					markAsReadMutation.mutate(selectedMessage.id);
				}
			} else {
				throw new Error(data.error || "Failed to send reply");
			}
		} catch (error) {
			console.error("Error sending reply:", error);
			toast.error(error.message || "Failed to send reply. Please try again.");
		} finally {
			setIsSendingReply(false);
		}
	};

	const filteredMessages = useMemo(() => {
		return messages.filter((message) => {
			const matchesSearch =
				message.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				message.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				message.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				message.message?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesRead =
				readFilter === "all" ||
				(readFilter === "read" && message.read) ||
				(readFilter === "unread" && !message.read);

			const matchesReplied =
				repliedFilter === "all" ||
				(repliedFilter === "replied" && message.replied) ||
				(repliedFilter === "unreplied" && !message.replied);

			return matchesSearch && matchesRead && matchesReplied;
		});
	}, [messages, searchQuery, readFilter, repliedFilter]);

	// Sort messages
	const sortedMessages = useMemo(() => {
		return [...filteredMessages].sort((a, b) => {
			if (!sortField) return 0;

			// Handle date comparison
			if (sortField === "date" || sortField === "createdAt") {
				const dateA = new Date(a.createdAt || a.created_at || 0);
				const dateB = new Date(b.createdAt || b.created_at || 0);
				return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
			}

			// Handle string comparison for other fields
			let aValue, bValue;

			switch (sortField) {
				case "from":
				case "name":
					aValue = (a.name || a.email || "").toLowerCase();
					bValue = (b.name || b.email || "").toLowerCase();
					break;
				case "email":
					aValue = (a.email || "").toLowerCase();
					bValue = (b.email || "").toLowerCase();
					break;
				case "subject":
					aValue = (a.subject || "").toLowerCase();
					bValue = (b.subject || "").toLowerCase();
					break;
				case "status":
					// Sort by read status first, then replied status
					const aRead = a.read ? 1 : 0;
					const bRead = b.read ? 1 : 0;
					const aReplied = a.replied ? 1 : 0;
					const bReplied = b.replied ? 1 : 0;
					if (aRead !== bRead) {
						return sortDirection === "asc" ? aRead - bRead : bRead - aRead;
					}
					return sortDirection === "asc"
						? aReplied - bReplied
						: bReplied - aReplied;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
			if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [filteredMessages, sortField, sortDirection]);

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
		if (!date) return "N/A";
		const d = date?.toDate ? date.toDate() : new Date(date);
		return d.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const unreadCount = messages.filter((m) => !m.read).length;

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between border-b py-2 px-4">
				<div>
					<h1 className="text-lg text-foreground">Messages</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Manage customer inquiries and support messages
					</p>
				</div>
				<div className="flex items-center gap-2">
					{unreadCount > 0 && (
						<div className="px-3 py-1 bg-primary text-primary-foreground rounded-xl text-xs font-semibold">
							{unreadCount} Unread
						</div>
					)}
					<ExportDropdown
						dataType="messages"
						data={sortedMessages.map((m) => ({
							...m,
							status: m.replied ? "replied" : m.read ? "read" : "unread",
						}))}
					/>
					<Button
						onClick={() =>
							toast.info(
								"Messages are created from the contact form. Reply to a message from the Actions column."
							)
						}
						className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
					>
						<Plus className="w-3.5 h-3.5" />
						New Message
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex items-center gap-4 mx-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search messages by name, email, subject, or message..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
					/>
				</div>
				<AnimatedDropdown
					isOpen={readFilterDropdownOpen}
					onToggle={() => setReadFilterDropdownOpen(!readFilterDropdownOpen)}
					onSelect={(value) => setReadFilter(value)}
					options={[
						{ value: "all", label: "All Messages" },
						{ value: "unread", label: "Unread" },
						{ value: "read", label: "Read" },
					]}
					value={readFilter}
					placeholder="All Messages"
					className="w-48"
					buttonClassName="text-sm"
				/>
				<AnimatedDropdown
					isOpen={repliedFilterDropdownOpen}
					onToggle={() =>
						setRepliedFilterDropdownOpen(!repliedFilterDropdownOpen)
					}
					onSelect={(value) => setRepliedFilter(value)}
					options={[
						{ value: "all", label: "All Replies" },
						{ value: "replied", label: "Replied" },
						{ value: "unreplied", label: "Unreplied" },
					]}
					value={repliedFilter}
					placeholder="All Replies"
					className="w-48"
					buttonClassName="text-sm"
				/>
			</div>

			{/* Table */}
			<div className="overflow-x-auto px-4">
				{isLoading ? (
					<TableSkeleton rows={5} columns={6} />
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead sortable onClick={() => handleSort("from")}>
									<div className="flex items-center gap-2">
										From
										{getSortIcon("from")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("subject")}>
									<div className="flex items-center gap-2">
										Subject
										{getSortIcon("subject")}
									</div>
								</TableHead>
								<TableHead>Message</TableHead>
								<TableHead sortable onClick={() => handleSort("date")}>
									<div className="flex items-center gap-2">
										Date
										{getSortIcon("date")}
									</div>
								</TableHead>
								<TableHead sortable onClick={() => handleSort("status")}>
									<div className="flex items-center gap-2">
										Status
										{getSortIcon("status")}
									</div>
								</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty
									colSpan={6}
									message="Error loading messages. Please try again."
								/>
							) : sortedMessages.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message={
										searchQuery ||
										readFilter !== "all" ||
										repliedFilter !== "all"
											? "No messages found matching your filters."
											: "No messages yet. Messages from the contact form will appear here."
									}
								/>
							) : (
								sortedMessages.map((message) => (
									<TableRow
										key={message.id}
										className={!message.read ? "bg-blue-50/50" : ""}
									>
										<TableCell>
											<div>
												<div className="font-medium text-sm text-foreground flex items-center gap-2">
													{!message.read && (
														<span className="w-2 h-2 bg-blue-600 rounded-full"></span>
													)}
													{message.name || "Anonymous"}
												</div>
												<div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
													<Mail className="w-3 h-3" />
													{message.email}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-sm text-foreground">
												{message.subject}
											</div>
										</TableCell>
										<TableCell>
											<div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
												{message.message}
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											<div className="text-xs flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												{formatDate(message.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex flex-col gap-1">
												{message.replied ? (
													<div className="flex items-center gap-1.5 text-xs text-green-600">
														<CheckCircle2 className="w-3.5 h-3.5" />
														<span className="font-medium">Replied</span>
													</div>
												) : (
													<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
														<span>Not replied</span>
													</div>
												)}
												{message.read ? (
													<div className="text-xs text-muted-foreground">Read</div>
												) : (
													<div className="text-xs text-blue-600 font-medium">
														Unread
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<button
													onClick={() => handleReplyClick(message)}
													className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-xl transition-colors"
													title="Reply to message"
												>
													<Send className="w-4 h-4" />
												</button>
												{!message.read && (
													<button
														onClick={() => markAsReadMutation.mutate(message.id)}
														className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
														title="Mark as read"
													>
														<Eye className="w-4 h-4" />
													</button>
												)}
												<button
													onClick={() => {
														if (
															confirm(
																"Are you sure you want to delete this message?"
															)
														) {
															deleteMessageMutation.mutate(message.id);
														}
													}}
													className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-xl transition-colors"
													title="Delete message"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>

			{/* Reply Modal */}
			<AnimatePresence>
				{replyModalOpen && selectedMessage && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setReplyModalOpen(false)}
							className="fixed inset-0 bg-black bg-opacity-50 z-50"
						/>
						{/* Modal */}
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
							<motion.div
								initial={{ opacity: 0, scale: 0.95, y: 20 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 20 }}
								onClick={(e) => e.stopPropagation()}
								className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
							>
								{/* Header */}
								<div className="flex items-center justify-between p-6 border-b border">
									<div>
										<h2 className="text-xl font-bold text-foreground">
											Reply to Message
										</h2>
										<p className="text-sm text-muted-foreground mt-1">
											To: {selectedMessage.name || "Anonymous"} (
											{selectedMessage.email})
										</p>
									</div>
									<button
										onClick={() => setReplyModalOpen(false)}
										className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								{/* Original Message Preview */}
								<div className="p-6 bg-muted border-b border">
									<p className="text-xs font-semibold text-muted-foreground mb-2">
										Original Message:
									</p>
									<div className="text-sm text-muted-foreground bg-card p-4 rounded-xl border border">
										<p className="font-medium text-foreground mb-2">
											{selectedMessage.subject}
										</p>
										<p className="whitespace-pre-wrap">
											{selectedMessage.message}
										</p>
									</div>
								</div>

								{/* Reply Form */}
								<form
									onSubmit={handleSendReply}
									className="flex-1 overflow-y-auto p-6 space-y-4"
								>
									<div>
										<label className="block text-sm font-medium text-foreground mb-1">
											Subject
										</label>
										<input
											type="text"
											value={replyForm.subject}
											onChange={(e) =>
												setReplyForm({
													...replyForm,
													subject: e.target.value,
												})
											}
											required
											className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-foreground mb-1">
											Message
										</label>
										<textarea
											value={replyForm.content}
											onChange={(e) =>
												setReplyForm({
													...replyForm,
													content: e.target.value,
												})
											}
											required
											rows={8}
											placeholder="Type your reply here..."
											className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none"
										/>
									</div>
									<div className="flex items-center justify-end gap-3 pt-4 border-t border">
										<button
											type="button"
											onClick={() => setReplyModalOpen(false)}
											className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
										>
											Cancel
										</button>
										<Button type="submit" disabled={isSendingReply}  className="rounded-xl gap-2 disabled:opacity-50">
											<Send className="w-4 h-4" />
											{isSendingReply ? "Sending..." : "Send Reply"}
										</Button>
									</div>
								</form>
							</motion.div>
						</div>
					</>
				)}
			</AnimatePresence>
		</div>
	);
};

export default MessagesTab;
