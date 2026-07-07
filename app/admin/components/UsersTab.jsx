import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { getAllUsers } from "../../../lib/api/users";
import TableSkeleton from "../../../lib/ui/TableSkeleton";
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

const UsersTab = () => {
	const [searchQuery, setSearchQuery] = useState("");

	// Fetch users with React Query
	const {
		data: users = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["users"],
		queryFn: getAllUsers,
	});

	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const filteredUsers = useMemo(() => {
		if (!searchQuery.trim()) return users;
		const q = searchQuery.toLowerCase();
		return users.filter((u) => {
			const name = (u.name || u.display_name || "").toLowerCase();
			const email = (u.email || "").toLowerCase();
			const id = (u.uid || u.id || "").toLowerCase();
			return name.includes(q) || email.includes(q) || id.includes(q);
		});
	}, [users, searchQuery]);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex justify-between items-center border-b py-2 px-4">
				<div>
					<h2 className="text-lg text-foreground">Authenticated Users</h2>
					<p className="text-sm text-muted-foreground mt-1">
						List of users that have signed in to the website
					</p>
				</div>
				<div className="flex items-center gap-2">
					<ExportDropdown
						dataType="users"
						data={filteredUsers.map((u) => ({
							...u,
							displayName:
								u.displayName ||
								u.display_name ||
								u.name ||
								u.display_name ||
								"Unknown",
							emailVerified: u.emailVerified ?? u.email_verified ?? false,
							createdAt: u.createdAt || u.created_at,
							lastSignIn: u.lastSignIn || u.last_sign_in,
						}))}
					/>
				<Button
					size="sm"
					className="gap-1.5 rounded-xl"
					onClick={() =>
						toast.info("Users are created via signup/auth. This is a read-only list.")
					}
				>
					<Plus className="w-3.5 h-3.5" />
					Add New User
				</Button>
				</div>
			</div>

			{/* Search */}
			<div className="relative mx-4">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Search users by name, email, or ID..."
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className="pl-10"
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
								<TableHead>User</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Provider</TableHead>
								<TableHead>Email Verified</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Last Sign In</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{error ? (
								<TableEmpty colSpan={6} message="Error loading users. Please try again." />
							) : filteredUsers.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message={
										searchQuery ? "No users found matching your search." : "No users found."
									}
								/>
							) : (
								filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												{user.photo_url || user.photoURL ? (
													<img
														src={user.photo_url || user.photoURL}
														alt={user.name || user.display_name}
														className="w-8 h-8 rounded-full object-cover"
													/>
												) : (
													<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
														<span className="text-xs font-medium text-muted-foreground">
															{(user.name || user.display_name || "U")
																.split(" ")
																.map((n) => n[0])
																.join("")
																.toUpperCase()}
														</span>
													</div>
												)}
												<div>
													<div className="font-medium text-foreground">
														{user.name || user.display_name || "Unknown"}
													</div>
													<div className="text-xs text-muted-foreground font-mono">
														{user.uid || user.id}
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="font-medium text-foreground">{user.email}</div>
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													user.provider === "google"
														? "bg-muted text-foreground"
														: "bg-purple-100 text-purple-800"
												}`}
											>
												{user.provider === "google" ? "Google" : "Email"}
											</span>
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													user.email_verified || user.emailVerified
														? "bg-green-100 text-green-800"
														: "bg-yellow-100 text-yellow-800"
												}`}
											>
												{user.email_verified || user.emailVerified
													? "Verified"
													: "Unverified"}
											</span>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{formatDate(user.created_at || user.createdAt)}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{formatDate(user.last_sign_in || user.lastSignIn)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				)}
			</div>
		</div>
	);
};

export default UsersTab;
