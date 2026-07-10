import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminShell from "./AdminShell";
import HomeTab from "./components/HomeTab";
import BlogTab from "./components/BlogTab";
import UsersTab from "./components/UsersTab";
import PaymentsTab from "./components/PaymentsTab";
import InvoiceTab from "./components/InvoiceTab";
import SubmissionsTab from "./components/SubmissionsTab";
import PricingSlotsTab from "./components/PricingSlotsTab";
import AnalyticsTab from "./components/AnalyticsTab";
import { useAppQueryClient } from "../../lib/hooks/useQueryClient";

const Admin = () => {
	const queryClient = useAppQueryClient();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("home");

	useEffect(() => {
		if (router.query.tab && typeof router.query.tab === "string") {
			setActiveTab(router.query.tab);
		}
	}, [router.query.tab]);

	const handleTabSelect = (tabId) => {
		setActiveTab(tabId);
		router.replace(
			{ pathname: "/admin", query: tabId === "home" ? {} : { tab: tabId } },
			undefined,
			{ shallow: true }
		);
	};

	return (
		<AdminShell activeTab={activeTab} onTabSelect={handleTabSelect}>
			<div className="py-2 h-full overflow-y-auto">
				{activeTab === "home" && <HomeTab onNavigate={handleTabSelect} />}
				{activeTab === "analytics" && <AnalyticsTab />}
				{activeTab === "users" && <UsersTab />}
				{(activeTab === "submissions" || activeTab === "forms") && (
					<SubmissionsTab queryClient={queryClient} />
				)}
				{activeTab === "pricing-slots" && (
					<PricingSlotsTab queryClient={queryClient} />
				)}
				{activeTab === "payments" && (
					<PaymentsTab queryClient={queryClient} />
				)}
				{activeTab === "invoices" && (
					<InvoiceTab queryClient={queryClient} />
				)}
				{activeTab === "blogs" && <BlogTab queryClient={queryClient} />}
			</div>
		</AdminShell>
	);
};

export default Admin;
