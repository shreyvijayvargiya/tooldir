import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, LogIn, User, ChevronDown, LogOut } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSubscription } from "../../lib/hooks/useSubscription";
import LoginModal from "../../lib/ui/LoginModal";
import {
	getUserCookie,
	removeUserCookie,
	setUserCookie,
} from "../../lib/utils/cookies";
import { signOutUser, onAuthStateChange } from "../../lib/api/auth";
import { toast } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ThemeCustomizerButton } from "@/components/theme/ThemeCustomizer";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [showLoginModal, setShowLoginModal] = React.useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const authUnsubscribeRef = useRef(null);
	const subscription = useSubscription();

	const { data: user } = useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => {
			const cookieUser = getUserCookie();

			if (!authUnsubscribeRef.current) {
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
						queryClient.setQueryData(["currentUser"], userData);
					} else {
						removeUserCookie();
						queryClient.setQueryData(["currentUser"], null);
					}
				});

				authUnsubscribeRef.current = unsubscribe;
			}

			return cookieUser;
		},
		enabled: true,
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	useEffect(() => {
		return () => {
			if (authUnsubscribeRef.current) {
				authUnsubscribeRef.current();
				authUnsubscribeRef.current = null;
			}
		};
	}, []);

	const handleLogout = async () => {
		try {
			removeUserCookie();
			queryClient.setQueryData(["currentUser"], null);
			await signOutUser();
			queryClient.setQueryData(["currentUser"], null);
			await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
			setIsMobileMenuOpen(false);
			toast.success("Logged out successfully!");
		} catch (error) {
			console.error("Logout error:", error);
			removeUserCookie();
			queryClient.setQueryData(["currentUser"], null);
			toast.error("Failed to logout. Please try again.");
		}
	};

	const navLinks = [
		{ href: "/", label: "Home" },
		{ href: "/features", label: "Features" },
		{ href: "/blog", label: "Blog" },
		{ href: "/pricing", label: "Pricing" },
		{ href: "/contact", label: "Contact" },
	];

	const isActive = (href) => {
		if (href === "/") {
			return router.pathname === "/";
		}
		return router.pathname.startsWith(href);
	};

	const UserAvatar = ({ size = "sm" }) => {
		const sizeClass = size === "lg" ? "w-16 h-16" : size === "md" ? "w-10 h-10" : "w-4 h-4";
		const iconSize = size === "lg" ? "w-8 h-8" : size === "md" ? "w-5 h-5" : "w-4 h-4";

		if (user?.photoURL) {
			return (
				<img
					src={user.photoURL}
					alt={user.displayName}
					className={`${sizeClass} rounded-full`}
				/>
			);
		}

		return (
			<div
				className={`${sizeClass} rounded-full bg-muted flex items-center justify-center`}
			>
				<User className={`${iconSize} text-muted-foreground`} />
			</div>
		);
	};

	const SubscriptionStatus = () =>
		subscription.isSubscribed && subscription.status === "active" ? (
			<Badge variant="secondary" className="text-green-600 bg-green-50">
				Active - {subscription.planName || "Pro"}
			</Badge>
		) : (
			<p className="text-sm text-muted-foreground">No active subscription</p>
		);

	return (
		<>
			<nav className="sticky top-0 z-50 bg-background border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link href="/" className="flex items-center">
							<span className="text-lg font-semibold -rotate-3 text-foreground p-1 border border-dashed">
								YourApp
							</span>
						</Link>

						<div className="hidden md:flex items-center gap-6">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className={`text-sm font-medium transition-colors ${
										isActive(link.href)
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{link.label}
								</Link>
							))}
						</div>

						<div className="hidden md:flex items-center gap-2">
							<ThemeCustomizerButton />
							<ThemeToggle />
							{user ? (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="secondary" className="gap-2">
											<UserAvatar />
											<span className="text-sm font-medium">
												{user.displayName}
											</span>
											<ChevronDown className="w-4 h-4 text-muted-foreground" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-64">
										<div className="p-4 text-center">
											<div className="flex justify-center mb-2">
												<UserAvatar size="lg" />
											</div>
											<p className="text-sm font-medium">{user.displayName}</p>
											<p className="text-xs text-muted-foreground mt-1">
												{user.email}
											</p>
										</div>
										<DropdownMenuSeparator />
										<div className="p-4">
											<p className="text-xs text-muted-foreground mb-2">
												Subscription Status
											</p>
											<SubscriptionStatus />
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={handleLogout}
											className="text-destructive focus:text-destructive cursor-pointer"
										>
											<LogOut className="w-4 h-4" />
											Logout
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							) : (
								<Button onClick={() => setShowLoginModal(true)}>
									<LogIn className="w-4 h-4" />
									Get Started
								</Button>
							)}
						</div>

						<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
							<SheetTrigger asChild>
								<div className="flex items-center gap-1 md:hidden">
									<ThemeCustomizerButton />
									<ThemeToggle />
									<Button variant="ghost" size="icon">
										<Menu className="w-6 h-6" />
									</Button>
								</div>
							</SheetTrigger>
							<SheetContent side="right" className="w-[300px]">
								<SheetHeader>
									<SheetTitle>Menu</SheetTitle>
								</SheetHeader>
								<div className="mt-6 space-y-3">
									{navLinks.map((link) => (
										<Link
											key={link.href}
											href={link.href}
											onClick={() => setIsMobileMenuOpen(false)}
											className={`block text-sm font-medium transition-colors ${
												isActive(link.href)
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground"
											}`}
										>
											{link.label}
										</Link>
									))}
									<Separator className="my-4" />
									{user ? (
										<div className="space-y-3">
											<div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
												<UserAvatar size="md" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{user.displayName}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{user.email}
													</p>
												</div>
											</div>
											<div className="p-3 bg-muted rounded-xl">
												<p className="text-xs text-muted-foreground mb-2">
													Subscription Status
												</p>
												<SubscriptionStatus />
											</div>
											<Button
												variant="destructive"
												className="w-full"
												onClick={handleLogout}
											>
												<LogOut className="w-4 h-4" />
												Logout
											</Button>
										</div>
									) : (
										<Button
											className="w-full"
											onClick={() => {
												setShowLoginModal(true);
												setIsMobileMenuOpen(false);
											}}
										>
											<LogIn className="w-4 h-4" />
											Get Started
										</Button>
									)}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</nav>

			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
			/>
		</>
	);
};

export default Navbar;
