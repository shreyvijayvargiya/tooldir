import React, { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Mail,
	Users,
	Shield,
	Eye,
	ShoppingBag,
	Menu,
	X,
	Search,
	LogIn,
	ChevronDown,
	Plus,
	Home,
	Calendar,
	CreditCard,
	MessageSquare,
	User,
	ExternalLink,
	RocketIcon,
} from "lucide-react";
import HomeTab from "./components/HomeTab";
import BlogTab from "./components/BlogTab";
import EmailTab from "./components/EmailTab";
import SubscribersTab from "./components/SubscribersTab";
import UsersTab from "./components/UsersTab";
import CustomersTab from "./components/CustomersTab";
import PaymentsTab from "./components/PaymentsTab";
import MessagesTab from "./components/MessagesTab";
import SearchModal from "./components/SearchModal";
import { markEmailAsSent } from "../../lib/api/emails";
import { onAuthStateChange } from "../../lib/api/auth";
import { getCachedUserRole } from "../../lib/utils/getUserRole";
import { ROLES } from "../../lib/config/roles-config";
import { getUserRole } from "../../lib/utils/getUserRole";
import { getCurrentUserEmail } from "../../lib/utils/getCurrentUserEmail";
import ConfirmationModal from "../../lib/ui/ConfirmationModal";
import LoginModal from "../../lib/ui/LoginModal";
import {
	getUserCookie,
	removeUserCookie,
	setUserCookie,
} from "../../lib/utils/cookies";
import { toast } from "react-toastify";

const Admin = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("home");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [user, setUser] = useState(null);
	const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState("Default Project");

	// Modal states
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [confirmData, setConfirmData] = useState({
		title: "",
		message: "",
		variant: "danger",
	});

	// Fetch user role with React Query
	const fetchUserRole = async () => {
		try {
			// Get current user email (from Supabase Auth or localStorage fallback)
			const userEmail = await getCurrentUserEmail();

			console.log("CMS: Current user email:", userEmail);

			if (userEmail) {
				// Fetch role from Supabase teams table using email
				// Supabase Auth users don't have role - we check teams table
				const role = await getUserRole(userEmail, false);
				console.log("CMS: Fetched role from teams collection:", role);
				return role;
			} else {
				console.warn("CMS: No user email found, using cached role");
				// Fallback to cached role
				return getCachedUserRole();
			}
		} catch (error) {
			console.error("Error fetching user role:", error);
			// Fallback to cached role
			return getCachedUserRole();
		}
	};

	const { data: userRole = "viewer" } = useQuery({
		queryKey: ["userRole"],
		queryFn: fetchUserRole,
		staleTime: 5 * 60 * 1000, // 5 minutes
		cacheTime: 10 * 60 * 1000, // 10 minutes
	});

	// Check if user is admin
	const isAdmin = userRole === ROLES.ADMIN;

	// Check for existing user in cookie on mount
	useEffect(() => {
		const cookieUser = getUserCookie();
		if (cookieUser) {
			setUser(cookieUser);
		}
	}, []);

	// Listen for auth state changes and refetch user role
	useEffect(() => {
		const unsubscribe = onAuthStateChange(async (supabaseUser) => {
			// Invalidate userRole query when auth state changes
			queryClient.invalidateQueries({ queryKey: ["userRole"] });

			// Update user state and cookie
			if (supabaseUser) {
				const userData = {
					uid: supabaseUser.uid,
					email: supabaseUser.email,
					displayName:
						supabaseUser.displayName ||
						supabaseUser.email?.split("@")[0] ||
						"User",
					photoURL: supabaseUser.photoURL || null,
					provider:
						supabaseUser.providerData?.[0]?.providerId === "google.com"
							? "google"
							: "email",
				};
				setUserCookie(userData);
				setUser(userData);
			} else {
				removeUserCookie();
				setUser(null);
			}
		});

		return () => unsubscribe();
	}, [queryClient]);

	// Keyboard shortcut for search (Cmd/Ctrl + K)
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setShowSearchModal(true);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Close project dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isProjectDropdownOpen && !event.target.closest(".project-dropdown")) {
				setIsProjectDropdownOpen(false);
			}
		};

		if (isProjectDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isProjectDropdownOpen]);

	// Send email to subscribers
	const handleSendEmail = async (email) => {
		if (!email.subject || !email.content) {
			toast.warning("Email must have subject and content");
			return;
		}

		setConfirmData({
			title: "Send Email",
			message: "Send this email to all active subscribers?",
			variant: "info",
		});
		setConfirmAction(() => async () => {
			try {
				const response = await fetch("/api/emails/send", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						emailId: email.id,
						subject: email.subject,
						content: email.content,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					toast.success(
						`Email sent successfully to ${data.stats.successCount} subscribers!`
					);
					// Update email in Firestore
					await markEmailAsSent(email.id, data.stats.successCount);
				} else {
					toast.error(data.error || "Failed to send email");
				}
			} catch (error) {
				console.error("Error sending email:", error);
				toast.error("Failed to send email. Please try again.");
			}
		});
		setShowConfirmModal(true);
	};

	// Send email to authenticated users
	const handleSendEmailToUsers = async (email) => {
		if (!email.subject || !email.content) {
			toast.warning("Email must have subject and content");
			return;
		}

		setConfirmData({
			title: "Send Email",
			message:
				"Send this email to all authenticated users with verified emails?",
			variant: "info",
		});
		setConfirmAction(() => async () => {
			try {
				const response = await fetch("/api/emails/send-to-users", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						emailId: email.id,
						subject: email.subject,
						content: email.content,
					}),
				});

				const data = await response.json();

				if (response.ok) {
					toast.success(
						`Email sent successfully to ${data.stats.successCount} users!`
					);
					// Update email in Firestore
					await markEmailAsSent(email.id, data.stats.successCount);
				} else {
					toast.error(data.error || "Failed to send email");
				}
			} catch (error) {
				console.error("Error sending email to users:", error);
				toast.error("Failed to send email. Please try again.");
			}
		});
		setShowConfirmModal(true);
	};

	return (
		<div className="h-screen w-screen bg-zinc-50 flex flex-col overflow-hidden">
			{/* Main Layout */}
			<div className="flex flex-1 overflow-hidden relative">
				{/* Mobile Overlay */}
				<AnimatePresence>
					{isSidebarOpen && (
						<>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								onClick={() => setIsSidebarOpen(false)}
								className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
							/>
						</>
					)}
				</AnimatePresence>

				{/* Sidebar */}
				<>
					{/* Desktop Sidebar - Always visible */}
					<aside className="hidden h-full py-6 px-3 md:flex w-48 bg-transparent flex-col justify-between items-start overflow-y-auto">
						<div className="space-y-2">
							<div className="">
								<div className="relative project-dropdown">
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() =>
											setIsProjectDropdownOpen(!isProjectDropdownOpen)
										}
										className="text-xs w-full flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
									>
										<RocketIcon className="w-3.5 h-3.5" />
										SAAS Starter Admin
									</motion.button>
								</div>
							</div>
							<div className="space-y-1">
								<button
									onClick={() => setShowSearchModal(true)}
									className="w-full px-1 py-1.5 text-sm font-medium transition-colors rounded-xl flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-300 mb-2"
								>
									<Search className="w-3.5 h-3.5" />
									<div className="flex items-center gap-2 justify-between">
										<p>Search</p>
										<i className="text-[10px] text-zinc-500">CMD/CTRL + K </i>
									</div>
								</button>
								<button
									onClick={() => setActiveTab("home")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "home"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<Home className="w-3.5 h-3.5" />
									Home
								</button>
								<button
									onClick={() => setActiveTab("blogs")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "blogs"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<FileText className="w-3.5 h-3.5" />
									Blogs
								</button>
								<button
									onClick={() => setActiveTab("emails")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "emails"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<Mail className="w-3.5 h-3.5" />
									Emails
								</button>
								<button
									onClick={() => setActiveTab("subscribers")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "subscribers"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<User className="w-3.5 h-3.5" />
									Email Subscribers
								</button>
								<button
									onClick={() => setActiveTab("users")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "users"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<Users className="w-3.5 h-3.5" />
									Users
								</button>

								<button
									onClick={() => setActiveTab("customers")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "customers"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<Users className="w-3.5 h-3.5" />
									Customers
								</button>
								<button
									onClick={() => setActiveTab("payments")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "payments"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<CreditCard className="w-3.5 h-3.5" />
									Payments
								</button>
								<button
									onClick={() => setActiveTab("messages")}
									className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
										activeTab === "messages"
											? "bg-zinc-100 text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
									}`}
								>
									<MessageSquare className="w-3.5 h-3.5" />
									Messages
								</button>
							</div>
						</div>
						<div className="">
							<a
								className="flex gap-1 items-center p-2 my-2 cursor-pointer text-sm text-zinc-500 hover:text-black"
								href="/docs"
								target="_blank"
							>
								<ExternalLink className="w-3 h-3" /> Read Docs
							</a>
							<button
								onClick={() => setShowLoginModal(true)}
								className="w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-black mb-2"
							>
								<LogIn className="w-3.5 h-3.5" />
								{user ? user.displayName || "Logged In" : "Login"}
							</button>
						</div>
					</aside>

					{/* Mobile Sidebar - Animated */}
					<AnimatePresence>
						{isSidebarOpen && (
							<motion.aside
								initial={{ x: -280 }}
								animate={{ x: 0 }}
								exit={{ x: -280 }}
								transition={{ type: "spring", damping: 25, stiffness: 200 }}
								className="fixed md:hidden inset-y-0 left-0 top-0 w-56 bg-white border-r border-zinc-200 overflow-y-auto z-50"
							>
								<div className="p-3 space-y-2">
									<div className="relative project-dropdown">
										<motion.button
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											onClick={() =>
												setIsProjectDropdownOpen(!isProjectDropdownOpen)
											}
											className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
										>
											<div className="py-1 px-2 rounded-xl bg-zinc-900 font-mono font-semibold text-white text-xs">
												C
											</div>
											<div className="flex-1 text-left">
												<div className="text-xs text-zinc-500">Project</div>
												<div className="text-sm font-semibold text-zinc-900">
													{selectedProject}
												</div>
											</div>
											<ChevronDown
												className={`w-4 h-4 text-zinc-400 transition-transform ${
													isProjectDropdownOpen ? "rotate-180" : ""
												}`}
											/>
										</motion.button>

										<AnimatePresence>
											{isProjectDropdownOpen && (
												<motion.div
													initial={{ opacity: 0, y: -10, scale: 0.95 }}
													animate={{ opacity: 1, y: 0, scale: 1 }}
													exit={{ opacity: 0, y: -10, scale: 0.95 }}
													transition={{ duration: 0.15 }}
													className="absolute top-full left-0 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden"
												>
													<motion.button
														whileHover={{ backgroundColor: "#f4f4f5" }}
														onClick={() => {
															setIsProjectDropdownOpen(false);
														}}
														className="w-full px-4 py-3 text-left flex items-center gap-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
													>
														<div className="py-1 px-2 rounded-xl bg-zinc-900 font-mono font-semibold text-white text-xs">
															C
														</div>
														<span className="text-sm font-medium">
															{selectedProject}
														</span>
													</motion.button>
													<div className="border-t border-zinc-200"></div>
													<motion.button
														whileHover={{ backgroundColor: "#f4f4f5" }}
														onClick={() => {
															toast.info(
																"Add New Project feature coming soon!"
															);
															setIsProjectDropdownOpen(false);
														}}
														className="w-full px-4 py-3 text-left flex items-center gap-2 text-zinc-600 hover:bg-zinc-50 transition-colors"
													>
														<Plus className="w-4 h-4" />
														<span className="text-sm font-medium">
															Add New Project
														</span>
													</motion.button>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
									<button
										onClick={() => {
											setShowSearchModal(true);
											setIsSidebarOpen(false);
										}}
										className="w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-300 mb-2"
									>
										<Search className="w-3.5 h-3.5" />
										Search
									</button>
									<button
										onClick={() => {
											setActiveTab("home");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "home"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Home className="w-3.5 h-3.5" />
										Home
									</button>
									<button
										onClick={() => {
											setActiveTab("blogs");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "blogs"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<FileText className="w-3.5 h-3.5" />
										Blogs
									</button>
									<button
										onClick={() => {
											setActiveTab("emails");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "emails"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Mail className="w-3.5 h-3.5" />
										Emails
									</button>
									<button
										onClick={() => {
											setActiveTab("subscribers");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "subscribers"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Users className="w-3.5 h-3.5" />
										Subscribers
									</button>
									<button
										onClick={() => {
											setActiveTab("users");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "users"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Users className="w-3.5 h-3.5" />
										Users
									</button>
									<button
										onClick={() => {
											setActiveTab("teams");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "teams"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Shield className="w-3.5 h-3.5" />
										Teams
									</button>
									<button
										onClick={() => {
											setActiveTab("preview");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "preview"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Eye className="w-3.5 h-3.5" />
										Blog Preview
									</button>
									<button
										onClick={() => {
											setActiveTab("calendar");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "calendar"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Calendar className="w-3.5 h-3.5" />
										Calendar
									</button>
									<button
										onClick={() => {
											setActiveTab("customers");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "customers"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<Users className="w-3.5 h-3.5" />
										Customers
									</button>
									<button
										onClick={() => {
											setActiveTab("payments");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "payments"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<CreditCard className="w-3.5 h-3.5" />
										Payments
									</button>
									<button
										onClick={() => {
											setActiveTab("messages");
											setIsSidebarOpen(false);
										}}
										className={`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 ${
											activeTab === "messages"
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
										}`}
									>
										<MessageSquare className="w-3.5 h-3.5" />
										Messages
									</button>
									<div className="p-3 space-y-1.5 mt-10">
										<div className="p-3 rounded-xl space-y-2 bg-white border border-zinc-200">
											<p className="text-lg">Content Management Template</p>
											<p className="text-sm text-zinc-600">
												Fastest way to create your own blog websites, email
												newsletter and manage audience
											</p>
											<motion.button
												whileHover={{ scale: 1.02 }}
												whileTap={{ scale: 0.98 }}
												onClick={() => {
													// Add your buy template link here
													window.open(
														"https://your-template-link.com",
														"_blank"
													);
												}}
												className="flex items-center gap-2 px-4 py-1.5 text-sm bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors font-medium"
											>
												<ShoppingBag className="w-3.5 h-3.5" />
												Buy Template
											</motion.button>
										</div>
									</div>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setIsSidebarOpen(!isSidebarOpen)}
										className="md:hidden fixed flex items-center gap-1 border border-zinc-100 bottom-4 z-50 right-4 p-2 text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
									>
										{isSidebarOpen ? "Close" : "Open"} Sidebar
										{isSidebarOpen ? (
											<X className="w-5 h-5" />
										) : (
											<Menu className="w-5 h-5" />
										)}
									</motion.button>
								</div>
							</motion.aside>
						)}
					</AnimatePresence>
				</>
				{/* Mobile Menu Toggle */}
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="md:hidden fixed flex items-center gap-1 border border-zinc-100 bottom-4 z-50 right-4 p-2 text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
				>
					{isSidebarOpen ? "Close" : "Open"} Sidebar
					{isSidebarOpen ? (
						<X className="w-5 h-5" />
					) : (
						<Menu className="w-5 h-5" />
					)}
				</motion.button>

				{/* Content Area */}
				<main className="flex-1 w-full h-full overflow-y-auto">
					<div className="h-full w-full md:p-6">
						<div className="h-full w-full bg-white rounded-2xl p-6 overflow-y-auto">
							{activeTab === "home" && <HomeTab />}
							{activeTab === "blogs" && <BlogTab />}
							{activeTab === "emails" && (
								<EmailTab onSendEmail={handleSendEmail} />
							)}
							{activeTab === "subscribers" && (
								<SubscribersTab onSendEmail={handleSendEmail} />
							)}
							{activeTab === "users" && (
								<UsersTab onSendEmailToUsers={handleSendEmailToUsers} />
							)}
							{activeTab === "customers" && <CustomersTab />}
							{activeTab === "payments" && <PaymentsTab />}
							{activeTab === "messages" && <MessagesTab />}
						</div>
					</div>
				</main>
			</div>

			{/* Confirmation Modal */}
			<ConfirmationModal
				isOpen={showConfirmModal}
				onClose={() => {
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				onConfirm={() => {
					if (confirmAction) {
						confirmAction();
					}
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				title={confirmData.title}
				message={confirmData.message}
				confirmText="Confirm"
				cancelText="Cancel"
				variant={confirmData.variant}
			/>

			{/* Search Modal */}
			<SearchModal
				isOpen={showSearchModal}
				onClose={() => setShowSearchModal(false)}
				onNavigate={setActiveTab}
			/>

			{/* Login Modal */}
			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
			/>
		</div>
	);
};

export default Admin;
