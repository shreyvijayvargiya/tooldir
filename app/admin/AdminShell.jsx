import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
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
import {
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@/components/ui/sidebar";

const MobileSidebarToggle = () => {
	const { openMobile, toggleSidebar } = useSidebar();

	return (
		<Button
			variant="outline"
			onClick={toggleSidebar}
			className="md:hidden fixed flex items-center gap-1 bottom-14 z-50 right-2 rounded-xl shadow-lg"
		>
			{openMobile ? "Close" : "Open"} Sidebar
			{openMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
		</Button>
	);
};

const AdminShell = ({
	children,
	activeTab = "home",
	onTabSelect,
	contentClassName = "",
}) => {
	const router = useRouter();
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
		<SidebarProvider
			defaultOpen
			style={{
				"--sidebar-width": "12rem",
				"--sidebar-width-mobile": "16rem",
			}}
			className="h-screen w-screen bg-muted !min-h-0 overflow-hidden"
		>
			<Sidebar
				activeTab={activeTab}
				onTabSelect={handleTabSelect}
				setShowSearchModal={setShowSearchModal}
				setShowLoginModal={setShowLoginModal}
				user={user}
			/>

			<SidebarInset className="flex-1 min-w-0 overflow-hidden bg-muted">
				<main className="flex-1 w-full h-full overflow-y-auto">
					<div className={`h-full w-full md:p-2 ${contentClassName}`}>
						<div className="h-full w-full bg-card border rounded-2xl overflow-y-auto">
							{children}
						</div>
					</div>
				</main>
			</SidebarInset>

			<MobileSidebarToggle />

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
		</SidebarProvider>
	);
};

export default AdminShell;
