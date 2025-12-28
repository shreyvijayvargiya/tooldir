import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { getAllEmails } from "../../../lib/api/emails";
import TableSkeleton from "../../../lib/ui/TableSkeleton";

const loadUsers = async () => {
	const usersRef = collection(db, "users");
	const q = query(usersRef, orderBy("createdAt", "desc"));
	const querySnapshot = await getDocs(q);
	const usersData = [];

	querySnapshot.forEach((doc) => {
		usersData.push({
			id: doc.id,
			...doc.data(),
		});
	});

	return usersData;
};

const UsersTab = () => {
	// Fetch users with React Query
	const {
		data: users = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["users"],
		queryFn: loadUsers,
	});

	const [demoUsers, setDemoUsers] = useState([
		{
			id: "1",
			name: "Shrey Vijay Vargiya",
			email: "shreyvijayvargiya26@gmail.com",
			photoURL: "https://github.com/shreyvijayvargiya.png",
			provider: "google",
			emailVerified: true,
			createdAt: new Date("2025-01-01"),
			lastSignIn: new Date("2025-01-01"),
		},
		
	]);


	// Format date
	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = dateString?.toDate
			? dateString.toDate()
			: new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div>
			<div className="mb-4">
				<h2 className="text-xl font-semibold text-zinc-900">
					Authenticated Users
				</h2>
				<p>List of users that have signed in to the websites</p>
			</div>

			<div className="overflow-x-auto border border-zinc-200 rounded-xl">
				<table className="w-full">
					<thead>
						<tr className="border-b border-zinc-200 bg-zinc-50">
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-l border-r border-zinc-200">
								User
							</th>
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-r border-zinc-200">
								Email
							</th>
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-r border-zinc-200">
								Provider
							</th>
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-r border-zinc-200">
								Email Verified
							</th>
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-r border-zinc-200">
								Created
							</th>
							<th className="text-left py-3 px-4 font-semibold text-zinc-700 border-r border-zinc-200">
								Last Sign In
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<TableSkeleton rows={5} columns={6} />
						) : error ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									Error loading users. Please try again.
								</td>
							</tr>
						) : users.length === 0 ? (
							<tr>
								<td colSpan={6} className="py-8 text-center text-zinc-500">
									No users found.
								</td>
							</tr>
						) : (
							demoUsers.map((user, index) => (
								<tr
									key={user.id}
									className={`${
										index === demoUsers.length - 1 ? "" : "border-b border-zinc-200"
									} hover:bg-zinc-50 transition-colors`}
								>
									<td className="py-3 px-4 border-l border-r border-zinc-200">
										<div className="flex items-center gap-3">
											{user.photoURL ? (
												<img
													src={user.photoURL}
													alt={user.name}
													className="w-8 h-8 rounded-full object-cover"
												/>
											) : (
												<div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
													<span className="text-xs font-medium text-zinc-600">
														{user.name
															?.split(" ")
															.map((n) => n[0])
															.join("")
															.toUpperCase() || "U"}
													</span>
												</div>
											)}
											<div>
												<div className="font-medium text-zinc-900">
													{user.name || user.displayName || "Unknown"}
												</div>
												<div className="text-xs text-zinc-500 font-mono">
													{user.uid}
												</div>
											</div>
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<div className="font-medium text-zinc-900">
											{user.email}
										</div>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												user.provider === "google"
													? "bg-zinc-100 text-zinc-800"
													: "bg-purple-100 text-purple-800"
											}`}
										>
											{user.provider === "google" ? "Google" : "Email"}
										</span>
									</td>
									<td className="py-3 px-4 border-r border-zinc-200">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												user.emailVerified
													? "bg-green-100 text-green-800"
													: "bg-yellow-100 text-yellow-800"
											}`}
										>
											{user.emailVerified ? "Verified" : "Unverified"}
										</span>
									</td>
									<td className="py-3 px-4 text-sm text-zinc-600 border-r border-zinc-200">
										{formatDate(user.createdAt)}
									</td>
									<td className="py-3 px-4 text-sm text-zinc-600 border-r border-zinc-200">
										{formatDate(user.lastSignIn)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default UsersTab;
