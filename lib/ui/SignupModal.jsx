import React, { useState, useEffect } from "react";
import { Mail, Lock, User } from "lucide-react";
import { signUpWithEmail, onAuthStateChange } from "../api/auth";
import { setUserCookie, getUserCookie } from "../utils/cookies";
import { toast } from "@/lib/toast";
import LoginModal from "./LoginModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const SignupModal = ({ isOpen, onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [error, setError] = useState("");
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	useEffect(() => {
		const cookieUser = getUserCookie();
		if (cookieUser) {
			setUser(cookieUser);
		} else {
			setUser(null);
		}
		setError("");
	}, [isOpen]);

	useEffect(() => {
		setError("");
	}, [email]);

	useEffect(() => {
		if (!isOpen) return;

		const unsubscribe = onAuthStateChange(async (supabaseUser) => {
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
				toast.success("Account created successfully!");
				onClose();
			}
		});

		return () => unsubscribe();
	}, [isOpen, onClose]);

	const handleSignup = async (e) => {
		e.preventDefault();
		setError("");

		if (!email || !password || !displayName) {
			const errorMsg = "Please fill in all fields";
			setError(errorMsg);
			toast.error(errorMsg);
			return;
		}

		if (password.length < 6) {
			const errorMsg = "Password must be at least 6 characters long";
			setError(errorMsg);
			toast.error(errorMsg);
			return;
		}

		setIsLoading(true);
		try {
			await signUpWithEmail(email, password, displayName);
		} catch (error) {
			console.error("Signup error:", error);
			const errorMsg =
				error.message || "Failed to create account. Please try again.";
			setError(errorMsg);
			if (!errorMsg.includes("already exists")) {
				toast.error(errorMsg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen && !isLoginModalOpen) return null;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Account</DialogTitle>
					</DialogHeader>
					{user ? (
						<div className="space-y-4 text-center">
							<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
								<User className="w-8 h-8 text-green-600" />
							</div>
							<h4 className="text-lg font-semibold text-foreground">
								Account Created!
							</h4>
							<p className="text-sm text-muted-foreground">
								Welcome, {user.displayName}!
							</p>
						</div>
					) : (
						<form onSubmit={handleSignup} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="signup-displayName">Full Name</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										id="signup-displayName"
										type="text"
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="Enter your full name"
										className="pl-10"
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="signup-email">Email</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										id="signup-email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="Enter your email"
										className="pl-10"
										required
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="signup-password">Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
									<Input
										id="signup-password"
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Enter your password (min. 6 characters)"
										className="pl-10"
										required
										minLength={6}
									/>
								</div>
							</div>
							{error && (
								<div className="p-3 bg-red-50 border border-red-200 rounded-xl">
									<p className="text-sm text-red-600">{error}</p>
								</div>
							)}
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Creating account..." : "Sign Up"}
							</Button>
							<p className="text-sm text-center text-muted-foreground">
								Already a user?{" "}
								<button
									type="button"
									onClick={() => {
										setIsLoginModalOpen(true);
										onClose();
									}}
									className="text-foreground font-medium hover:underline"
								>
									Login
								</button>
							</p>
						</form>
					)}
				</DialogContent>
			</Dialog>
			<LoginModal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
			/>
		</>
	);
};

export default SignupModal;
