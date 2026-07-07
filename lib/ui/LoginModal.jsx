import React, { useState, useEffect } from "react";
import { Mail, Lock, LogOut, User } from "lucide-react";
import {
	signInWithEmail,
	signInWithGoogle,
	signOutUser,
	onAuthStateChange,
} from "../api/auth";
import {
	setUserCookie,
	getUserCookie,
	removeUserCookie,
} from "../utils/cookies";
import { toast } from "@/lib/toast";
import SignupModal from "./SignupModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const LoginModal = ({ isOpen, onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useState(null);
	const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

	useEffect(() => {
		const cookieUser = getUserCookie();
		setUser(cookieUser || null);
	}, [isOpen]);

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
				toast.success("Logged in successfully!");
			} else {
				removeUserCookie();
				setUser(null);
			}
		});
		return () => unsubscribe();
	}, [isOpen]);

	const handleEmailLogin = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			toast.error("Please enter both email and password");
			return;
		}
		setIsLoading(true);
		try {
			await signInWithEmail(email, password);
		} catch (error) {
			toast.error(error.message || "Failed to login. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleLogin = async () => {
		setIsLoading(true);
		try {
			await signInWithGoogle();
		} catch (error) {
			toast.error(error.message || "Failed to login with Google. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			await signOutUser();
			removeUserCookie();
			setUser(null);
			toast.success("Logged out successfully!");
			onClose();
		} catch (error) {
			toast.error("Failed to logout. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{user ? "Account" : "Login"}</DialogTitle>
					</DialogHeader>
					{user ? (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								{user.photoURL ? (
									<img src={user.photoURL} alt={user.displayName} className="w-16 h-16 rounded-full object-cover" />
								) : (
									<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
										<User className="w-8 h-8 text-muted-foreground" />
									</div>
								)}
								<div className="flex-1">
									<h4 className="text-lg font-semibold">{user.displayName}</h4>
									<p className="text-sm text-muted-foreground">{user.email}</p>
									<Badge variant="secondary" className="mt-1">
										{user.provider === "google" ? "Google" : "Email"}
									</Badge>
								</div>
							</div>
							<Button variant="destructive" className="w-full" onClick={handleLogout} disabled={isLoading}>
								<LogOut className="w-4 h-4" />
								{isLoading ? "Logging out..." : "Logout"}
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<form onSubmit={handleEmailLogin} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="login-email">Email</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10" required />
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="login-password">Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-10" required />
									</div>
								</div>
								<Button type="submit" className="w-full" disabled={isLoading}>
									{isLoading ? "Logging in..." : "Login"}
								</Button>
							</form>
							<div className="relative">
								<Separator />
								<span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">Or continue with</span>
							</div>
							<Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
								<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
								{isLoading ? "Logging in..." : "Google"}
							</Button>
							<p className="text-sm text-center text-muted-foreground">
								New user?{" "}
								<button type="button" onClick={() => { setIsSignupModalOpen(true); onClose(); }} className="text-foreground font-medium hover:underline">
									Sign Up
								</button>
							</p>
						</div>
					)}
				</DialogContent>
			</Dialog>
			<SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} />
		</>
	);
};

export default LoginModal;
