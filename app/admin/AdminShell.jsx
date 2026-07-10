import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Sidebar from "./components/Sidebar";
import SearchModal from "./components/SearchModal";
import LoginModal from "../../lib/ui/LoginModal";
import ConfirmationModal from "../../lib/ui/ConfirmationModal";
import { onAuthStateChange } from "../../lib/api/auth";
import {
	getUserCookie,
	removeUserCookie,
	setUserCookie,
} from "../../lib/utils/cookies";
import { Button } from "@/components/ui/button";

const AdminShell = ({
	children,
	activeTab = "analytics",
	onTabSelect,
	contentClassName = "",
}) => {
	const router = useRouter();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [user, setUser] = useState(null);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [confirmAction, setConfirmAction] = useState(null);
	const [confirmData, setConfirmData] = useState({
		title: "",
		message: "",
		variant: "danger",
	});

	useEffect(() => {
		const cookieUser = getUserCookie();
		if (cookieUser) setUser(cookieUser);
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChange(async (authUser) => {
			if (authUser) {
				const userData = {
					uid: authUser.uid,
					email: authUser.email,
					displayName:
						authUser.displayName ||
						authUser.email?.split("@")[0] ||
						"User",
					photoURL: authUser.photoURL || null,
					provider:
						authUser.providerData?.[0]?.providerId === "google.com"
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
	}, []);

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

	const handleTabSelect = (tabId) => {
		if (onTabSelect) {
			onTabSelect(tabId);
		} else if (router.pathname.startsWith("/admin/blogs")) {
			router.push(`/admin?tab=${tabId}`);
		}
	};

	const handleSearchNavigate = (tab) => {
		if (onTabSelect) {
			onTabSelect(tab);
		} else {
			router.push(`/admin?tab=${tab}`);
		}
	};

	return (
		<div className="h-screen w-screen bg-muted flex flex-col overflow-hidden">
			<div className="flex flex-1 overflow-hidden relative">
				<AnimatePresence>
					{isSidebarOpen && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsSidebarOpen(false)}
							className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
						/>
					)}
				</AnimatePresence>

				<Sidebar
					activeTab={activeTab}
					onTabSelect={handleTabSelect}
					isSidebarOpen={isSidebarOpen}
					setIsSidebarOpen={setIsSidebarOpen}
					setShowSearchModal={setShowSearchModal}
					setShowLoginModal={setShowLoginModal}
					user={user}
				/>

				<Button
					variant="outline"
					onClick={() => setIsSidebarOpen(!isSidebarOpen)}
					className="md:hidden fixed flex items-center gap-1 bottom-4 z-50 right-4 rounded-xl shadow-lg"
				>
					{isSidebarOpen ? "Close" : "Open"} Sidebar
					{isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
				</Button>

				<main className="flex-1 w-full h-full overflow-y-auto">
					<div className={`h-full w-full md:p-2 ${contentClassName}`}>
						<div className="h-full w-full bg-card border rounded-2xl overflow-y-auto">
							{children}
						</div>
					</div>
				</main>
			</div>

			<ConfirmationModal
				isOpen={showConfirmModal}
				onClose={() => {
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				onConfirm={() => {
					confirmAction?.();
					setShowConfirmModal(false);
					setConfirmAction(null);
				}}
				title={confirmData.title}
				message={confirmData.message}
				confirmText="Confirm"
				cancelText="Cancel"
				variant={confirmData.variant}
			/>

			<SearchModal
				isOpen={showSearchModal}
				onClose={() => setShowSearchModal(false)}
				onNavigate={handleSearchNavigate}
			/>

			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
			/>
		</div>
	);
};

export default AdminShell;
