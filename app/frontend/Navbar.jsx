import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu, LogIn, User, ChevronDown, LogOut, Search, PlusCircle, LayoutDashboard } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSubscription } from "../../lib/hooks/useSubscription";
import LoginModal from "../../lib/ui/LoginModal";
import CommandSearchModal from "./marketing/CommandSearchModal";
import {
	getUserCookie,
	removeUserCookie,
	setUserCookie,
} from "../../lib/utils/cookies";
import { isDemoUser, logoutDemoUser } from "../../lib/utils/demoUser";
import { signOutUser, onAuthStateChange } from "../../lib/api/auth";
import { toast } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ThemeCustomizerButton } from "@/components/theme/ThemeCustomizer";
import { usePreset } from "@/lib/presets/PresetContext";
import { isPresetSwitcherEnabled } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
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
import { cn } from "@/lib/utils";

const Navbar = () => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { preset } = usePreset();
	const showNavThemeCustomizer = !isPresetSwitcherEnabled();
	const [showLoginModal, setShowLoginModal] = React.useState(false);
	const [showCommandSearch, setShowCommandSearch] = React.useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
	const [mounted, setMounted] = React.useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		const onKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setShowCommandSearch(true);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const { data: user } = useQuery({
		queryKey: ["currentUser"],
		queryFn: async () => getUserCookie(),
		enabled: mounted,
		staleTime: Infinity,
		gcTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	});

	const subscription = useSubscription({ enabled: mounted && Boolean(user) });

	// Optional auth listener — never blocks public pages
	useEffect(() => {
		if (!mounted) return undefined;

		const handleAuthUpdate = (event) => {
			queryClient.setQueryData(["currentUser"], event.detail);
		};
		window.addEventListener("tooldir:auth", handleAuthUpdate);

		const unsubscribe = onAuthStateChange((supabaseUser) => {
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
			} else if (!isDemoUser(getUserCookie())) {
				removeUserCookie();
				queryClient.setQueryData(["currentUser"], null);
			}
		});

		return () => {
			window.removeEventListener("tooldir:auth", handleAuthUpdate);
			unsubscribe();
		};
	}, [mounted, queryClient]);

	const handleLogout = async () => {
		try {
			if (isDemoUser(user)) {
				logoutDemoUser();
			} else {
				removeUserCookie();
				await signOutUser();
			}
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

	const navLinks = isPresetSwitcherEnabled()
		? [
				{ href: "/", label: "Home" },
				{ href: "/generate", label: "Generate" },
				{ href: "/demo", label: "Templates" },
				{ href: "/blog", label: "Blog" },
				{ href: "/#buy", label: "Buy" },
				{ href: "/#contact", label: "Contact" },
			]
		: [
				{ href: "/", label: "Home" },
				{ href: "/blog", label: "Blog" },
				{ href: "/pricing", label: "Pricing" },
				{ href: "/contact", label: "Contact" },
			];

	const isActive = (href) => {
		if (href === "/") {
			return router.pathname === "/";
		}
		if (href.startsWith("/#")) {
			return router.pathname === "/" && router.asPath.includes(href.slice(1));
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

	const AuthActions = () => {
		if (!mounted) {
			return (
				<Button variant="secondary" className="gap-2" disabled>
					<div className="w-4 h-4 rounded-full bg-muted" />
					<span className="text-sm font-medium">Account</span>
				</Button>
			);
		}

		if (user) {
			return (
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
						<DropdownMenuItem asChild className="cursor-pointer">
							<Link href="/dashboard">
								<LayoutDashboard className="w-4 h-4" />
								Dashboard
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild className="cursor-pointer">
							<Link href="/submit">
								<PlusCircle className="w-4 h-4 text-primary" />
								{preset.landing.navSubmitLabel}
							</Link>
						</DropdownMenuItem>
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
			);
		}

		return (
			<Button onClick={() => setShowLoginModal(true)}>
				<LogIn className="w-4 h-4" />
				Get Started
			</Button>
		);
	};

	const MobileAuthActions = () => {
		if (!mounted) return null;

		if (user) {
			return (
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
					<Button asChild variant="outline" className="w-full justify-start">
						<Link
							href="/dashboard"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							<LayoutDashboard className="w-4 h-4" />
							Dashboard
						</Link>
					</Button>
					<Button
						variant="destructive"
						className="w-full"
						onClick={handleLogout}
					>
						<LogOut className="w-4 h-4" />
						Logout
					</Button>
				</div>
			);
		}

		return (
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
		);
	};

	return (
		<>
			<nav className="sticky top-0 z-50 bg-muted/50 border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						<Link href="/" className="flex items-center">
							<span className="text-lg font-semibold -rotate-3 text-foreground p-1 border border-dashed">
								{preset.brand}
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
							<Link
								href="/submit"
								className={cn(
									"inline-flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm font-medium transition-colors hover:bg-muted",
									isActive("/submit")
										? "border-foreground/20 text-foreground"
										: "text-muted-foreground hover:text-foreground"
								)}
							>
								<PlusCircle className="h-4 w-4 shrink-0 text-primary" />
								{preset.landing.navSubmitLabel}
							</Link>
						</div>

						<div className="hidden md:flex items-center gap-2">
							<button
								type="button"
								onClick={() => setShowCommandSearch(true)}
								className="flex h-9 w-56 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
							>
								<Search className="h-4 w-4 shrink-0" />
								<span className="flex-1 text-left truncate">Search...</span>
								<kbd className="pointer-events-none hidden h-5 select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
									<span className="text-xs">⌘</span>K
								</kbd>
							</button>
							<a
								href="https://x.com"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Follow on X"
							>
								<Button variant="ghost" size="icon">
									<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
										<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
									</svg>
								</Button>
							</a>
							{showNavThemeCustomizer ? <ThemeCustomizerButton /> : null}
							<ThemeToggle />
							<AuthActions />
						</div>

						<div className="flex items-center gap-1 md:hidden">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowCommandSearch(true)}
								aria-label="Search"
							>
								<Search className="w-5 h-5" />
							</Button>
							{showNavThemeCustomizer ? <ThemeCustomizerButton /> : null}
							<ThemeToggle />
							<Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
								<SheetTrigger asChild>
									<Button variant="ghost" size="icon" aria-label="Open menu">
										<Menu className="w-6 h-6" />
									</Button>
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
										<Link
											href="/submit"
											onClick={() => setIsMobileMenuOpen(false)}
											className={cn(
												"flex h-9 items-center gap-2 rounded-md border bg-muted/40 px-3 text-sm font-medium transition-colors hover:bg-muted",
												isActive("/submit")
													? "border-foreground/20 text-foreground"
													: "text-muted-foreground"
											)}
										>
											<PlusCircle className="h-4 w-4 shrink-0 text-primary" />
											{preset.landing.navSubmitLabel}
										</Link>
										<Separator className="my-4" />
										<Button
											variant="outline"
											className="w-full justify-start gap-2"
											onClick={() => {
												setIsMobileMenuOpen(false);
												setShowCommandSearch(true);
											}}
										>
											<Search className="w-4 h-4" />
											Search
											<span className="ml-auto text-xs text-muted-foreground">
												⌘K
											</span>
										</Button>
										<Separator className="my-4" />
										<MobileAuthActions />
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</nav>

			<CommandSearchModal
				open={showCommandSearch}
				onOpenChange={setShowCommandSearch}
			/>

			<LoginModal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
			/>
		</>
	);
};

export default Navbar;
