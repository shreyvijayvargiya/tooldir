import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
	Copy,
	ChevronLeft,
	ChevronRight,
	BookOpen,
	Rocket,
	Layers,
	Network,
	Code2,
	Database,
	Mail,
	CreditCard,
	Shield,
	Settings,
	Check,
	HelpCircle,
	Search,
	RocketIcon,
	Wrench,
	Download,
	GitHub,
	Globe,
	Github,
	File,
	Folder,
	FolderOpen,
	ChevronDown,
	ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "@/lib/toast";
import Fuse from "fuse.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

// Documentation sections configuration
const DOC_SECTIONS = [
	{
		id: "getting-started",
		title: "Getting Started",
		file: "getting-started.md",
		icon: Rocket,
	},
	{
		id: "tech-stack",
		title: "Tech Stack",
		file: "tech-stack.md",
		icon: Layers,
	},
	{
		id: "architecture",
		title: "Architecture",
		file: "architecture.md",
		icon: Network,
	},
	{ id: "apis", title: "APIs", file: "apis.md", icon: Code2 },
	{ id: "database", title: "Database", file: "database.md", icon: Database },
	{ id: "emailing", title: "Emailing", file: "emailing.md", icon: Mail },
	{
		id: "payments",
		title: "Payments",
		file: "payments.md",
		icon: CreditCard,
	},
	{
		id: "authentication",
		title: "Authentication",
		file: "authentication.md",
		icon: Shield,
	},
	{ id: "admin", title: "Admin", file: "admin.md", icon: Settings },
	{ id: "build", title: "Build", file: null, icon: Wrench },
	{ id: "faq", title: "FAQ", file: null, icon: HelpCircle },
];

// FAQ Questions and Answers
const FAQ_DATA = [
	{
		id: 1,
		question: "How do I set up Supabase Authentication?",
		answer:
			"To set up Supabase Authentication, go to Supabase Console, enable Email/Password and Google providers, then add your Supabase configuration to `.env.local` with all required environment variables. See the Authentication section for detailed steps.",
	},
	{
		id: 2,
		question: "How do I send emails to subscribers?",
		answer:
			"Use the Admin panel → Emails tab to create an email, then click 'Send to Subscribers'. The system will automatically batch send emails to all active subscribers using Resend API. Make sure you have configured your Resend API key in environment variables.",
	},
	{
		id: 3,
		question: "How do I configure Stripe payments?",
		answer:
			"Create a Stripe account, set up products and plans, get your API credentials, and add them to `.env.local`. Configure the webhook endpoint at `/api/stripe/webhook`. For local testing, use ngrok to forward webhooks to your local server.",
	},
	{
		id: 4,
		question: "What's the difference between Firestore and Supabase?",
		answer:
			"Firestore is a NoSQL database (primary) with real-time updates, while Supabase is a PostgreSQL database (optional) with SQL queries and Row Level Security. You can use either or both. Firestore is recommended for most use cases due to its simplicity and real-time capabilities.",
	},
	{
		id: 5,
		question: "How do I manage user roles and permissions?",
		answer:
			"User roles are stored in the Supabase `teams` collection, not in Supabase Auth. Add users to the teams collection with their email and role (admin, editor, author, or viewer). Roles are checked client-side and should be validated server-side for security.",
	},
	{
		id: 6,
		question: "How do I create and publish a blog post?",
		answer:
			"Go to Admin panel → Blogs tab, click 'Create New Blog', use the Tiptap editor to write your content, add a title and banner image, then save. To publish, change the status to 'published' and set the published date. The blog will be accessible via its slug.",
	},
	{
		id: 7,
		question: "How do I test webhooks locally?",
		answer:
			"Install ngrok (`npm install -g ngrok`), start your dev server (`npm run dev`), run `ngrok http 3000` in another terminal, copy the ngrok URL, and set it as your webhook URL in Stripe dashboard. Webhooks will be forwarded to your local server.",
	},
	{
		id: 8,
		question: "How do I add a new subscriber?",
		answer:
			"Go to Admin panel → Subscribers tab, click 'Add Subscriber', enter the email and optional name, then save. Subscribers can also subscribe through your website's subscription form. All subscribers are stored in Firestore `subscribers` collection.",
	},
	{
		id: 9,
		question: "How do I customize email templates?",
		answer:
			"Email templates are stored in `public/html/` directory. Edit the HTML files (like `send-subscription-confirm-email.html`) using inline CSS. Templates use placeholder variables like `{{customerName}}` that are replaced at send time.",
	},
	{
		id: 10,
		question: "How do I deploy the application?",
		answer:
			"Build the application with `npm run build`, then deploy to Vercel (recommended for Next.js) or any Node.js hosting. Make sure to set all environment variables in your hosting platform. Update Supabase Security Rules and Supabase RLS policies for production.",
	},
];

// Code block component with copy button (shared)
const CodeBlock = ({ language, children, ...props }) => {
	const [copied, setCopied] = useState(false);
	const codeString = String(children).replace(/\n$/, "");

	const lightTheme = {
		...oneLight,
	};

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(codeString);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			toast.success("Code copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy code:", error);
			toast.error("Failed to copy code");
		}
	};

	return (
		<div className="relative group mb-3">
			<div className="absolute top-2 right-2 z-10">
				<Button
					size="sm"
					variant={copied ? "secondary" : "outline"}
					onClick={handleCopyCode}
					className="h-7 gap-1.5 text-xs"
				>
					{copied ? (
						<>
							<Check className="w-3 h-3" />
							Copied
						</>
					) : (
						<>
							<Copy className="w-3 h-3" />
							Copy
						</>
					)}
				</Button>
			</div>
			<SyntaxHighlighter
				language={language || "javascript"}
				style={lightTheme}
				PreTag="div"
				className="rounded border border-border !bg-background"
				customStyle={{
					background: "hsl(var(--background))",
					padding: "1rem",
					margin: 0,
					fontSize: "0.75rem",
					border: "1px solid hsl(var(--border))",
				}}
				{...props}
			>
				{codeString}
			</SyntaxHighlighter>
		</div>
	);
};



export default function DocsPage() {
	const [activeSection, setActiveSection] = useState("getting-started");
	const [markdownContent, setMarkdownContent] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [showSearchModal, setShowSearchModal] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);

	// Initialize Fuse.js for search (memoized)
	const fuse = useMemo(
		() =>
			new Fuse(
				[
					...DOC_SECTIONS.filter((s) => s.file).map((section) => ({
						title: section.title,
						id: section.id,
						type: "section",
					})),
					...FAQ_DATA.map((faq) => ({
						title: faq.question,
						content: faq.answer,
						id: `faq-${faq.id}`,
						type: "faq",
					})),
				],
				{
					keys: ["title", "content"],
					threshold: 0.3,
					includeScore: true,
				}
			),
		[]
	);

	// Handle search
	useEffect(() => {
		if (searchQuery.trim()) {
			const results = fuse.search(searchQuery);
			setSearchResults(results.map((r) => r.item));
		} else {
			setSearchResults([]);
		}
	}, [searchQuery, fuse]);

	// Keyboard shortcut for search (Cmd/Ctrl + K)
	useEffect(() => {
		const handleKeyDown = (e) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setShowSearchModal(true);
			}
			if (e.key === "Escape" && showSearchModal) {
				setShowSearchModal(false);
				setSearchQuery("");
				setSearchResults([]);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [showSearchModal]);

	// Load markdown content
	useEffect(() => {
		const loadMarkdown = async () => {
			setIsLoading(true);
			try {
				const section = DOC_SECTIONS.find((s) => s.id === activeSection);
				if (!section) return;

				// Handle FAQ and Build sections (no file)
				if (section.id === "faq" || section.id === "build") {
					setMarkdownContent("");
					setIsLoading(false);
					return;
				}

				const response = await fetch(`/docs/${section.file}`);
				if (!response.ok) {
					throw new Error(`Failed to load ${section.file}`);
				}
				const content = await response.text();
				setMarkdownContent(content);
			} catch (error) {
				console.error("Error loading markdown:", error);
				setMarkdownContent(
					`# ${
						DOC_SECTIONS.find((s) => s.id === activeSection)?.title ||
						"Documentation"
					}\n\nContent not available.`
				);
				toast.error("Failed to load documentation");
			} finally {
				setIsLoading(false);
			}
		};

		loadMarkdown();
	}, [activeSection]);

	// Get current section index
	const currentIndex = DOC_SECTIONS.findIndex((s) => s.id === activeSection);
	const hasPrevious = currentIndex > 0;
	const hasNext = currentIndex < DOC_SECTIONS.length - 1;

	// Navigation handlers
	const handlePrevious = () => {
		if (hasPrevious) {
			setActiveSection(DOC_SECTIONS[currentIndex - 1].id);
		}
	};

	const handleNext = () => {
		if (hasNext) {
			setActiveSection(DOC_SECTIONS[currentIndex + 1].id);
		}
	};

	// Copy markdown to clipboard
	const handleCopyMarkdown = async () => {
		try {
			await navigator.clipboard.writeText(markdownContent);
			toast.success("Markdown copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy:", error);
			toast.error("Failed to copy markdown");
		}
	};

	// Copy code to clipboard (for FunctionListItem)
	const handleCopyCode = async (code, setCopied) => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			toast.success("Code copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy code:", error);
			toast.error("Failed to copy code");
		}
	};

	// Function reference list item component
	const FunctionListItem = ({ children }) => {
		const [copied, setCopied] = useState(false);

		// Extract function name and description from children
		const extractFunctionInfo = (node) => {
			if (Array.isArray(node)) {
				let functionName = "";
				let description = "";
				let foundCode = false;

				for (let i = 0; i < node.length; i++) {
					const item = node[i];

					// Check if it's a code element (inline code from markdown)
					if (
						item?.type === "code" ||
						(item?.props && item.props.inline !== undefined)
					) {
						foundCode = true;
						functionName = String(
							item.props?.children || item.children || ""
						).trim();

						// Look for description after colon in next items
						for (let j = i + 1; j < node.length; j++) {
							const nextItem = node[j];
							const nextText = String(nextItem || "");
							if (nextText.includes(":")) {
								description = nextText.split(":").slice(1).join(":").trim();
								break;
							}
							if (typeof nextItem === "string" && nextItem.trim()) {
								description += (description ? " " : "") + nextItem.trim();
							}
						}

						if (functionName && description) {
							return { found: true, functionName, description };
						}
					}

					// Also check if string contains the pattern
					if (typeof item === "string") {
						const match = item.match(/`([^`]+)`:\s*(.+)$/);
						if (match) {
							return {
								found: true,
								functionName: match[1].trim(),
								description: match[2].trim(),
							};
						}
					}
				}
			}

			// Check if it's a string directly
			if (typeof node === "string") {
				const match = node.match(/`([^`]+)`:\s*(.+)$/);
				if (match) {
					return {
						found: true,
						functionName: match[1].trim(),
						description: match[2].trim(),
					};
				}
			}

			return { found: false };
		};

		const functionInfo = extractFunctionInfo(children);

		if (functionInfo.found) {
			return (
				<div className="flex items-start gap-2 group/item">
					<Button
						size="sm"
						variant={copied ? "secondary" : "ghost"}
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(functionInfo.functionName);
								setCopied(true);
								setTimeout(() => setCopied(false), 2000);
								toast.success("Function name copied!");
							} catch (error) {
								toast.error("Failed to copy");
							}
						}}
						className={`flex-shrink-0 mt-0.5 h-6 w-6 p-0 ${copied ? "opacity-100" : "opacity-0 group-hover/item:opacity-100"}`}
					>
						{copied ? (
							<Check className="w-3 h-3" />
						) : (
							<Copy className="w-3 h-3" />
						)}
					</Button>
					<div className="flex-1">
						<code className="text-foreground font-mono text-xs font-semibold bg-muted px-1 py-0.5 rounded">
							{functionInfo.functionName}
						</code>
						<span className="text-muted-foreground text-sm ml-1">
							: {functionInfo.description}
						</span>
					</div>
				</div>
			);
		}

		return <>{children}</>;
	};

	return (
		<div className="min-h-screen bg-background flex">
			{/* Sidebar */}
			<aside className="hidden md:flex w-64 bg-background border-r border-border flex-col h-screen sticky top-0 font-mono">
				<div className="p-4">
					<div className="flex items-center gap-2">
						<RocketIcon className="w-5 h-5 text-foreground" />
						<h1 className="text-lg font-bold text-foreground font-mono">
							SAAS Starter
						</h1>
					</div>
				</div>
				<Separator />
				<nav className="flex-1 overflow-y-auto p-3">
					{/* Search Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowSearchModal(true)}
						className="w-full mb-2 text-xs font-mono justify-between"
					>
						<div className="flex items-center gap-2">
							<Search className="w-3.5 h-3.5" />
							<span>Search</span>
						</div>
						<Badge variant="secondary" className="text-[10px] font-normal">
							CMD/CTRL + K
						</Badge>
					</Button>
					<ul className="space-y-0.5">
						{DOC_SECTIONS.map((section) => {
							const IconComponent = section.icon;
							return (
								<li key={section.id}>
									<Button
										variant={activeSection === section.id ? "secondary" : "ghost"}
										size="sm"
										onClick={() => setActiveSection(section.id)}
										className="w-full justify-start text-xs font-mono"
									>
										<IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
										<span>{section.title}</span>
									</Button>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 flex flex-col">
				{/* Header with Copy Button */}
				<div className="max-w-4xl mx-auto w-full px-4 mt-4 flex items-center justify-between z-10">
					<h2 className="text-xl font-bold text-foreground">
						{DOC_SECTIONS.find((s) => s.id === activeSection)?.title ||
							"Documentation"}
					</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={handleCopyMarkdown}
						className="text-xs"
					>
						<Copy className="w-3.5 h-3.5" />
						Copy Markdown
					</Button>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-4xl mx-auto px-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-20">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
							</div>
						) : activeSection === "faq" ? (
							<div className="space-y-6">
								<h1 className="text-3xl font-bold text-foreground mb-6">
									Frequently Asked Questions
								</h1>
								<div className="space-y-4">
									{FAQ_DATA.map((faq) => (
										<Card key={faq.id}>
											<CardContent className="p-4">
												<h3 className="text-lg font-semibold text-foreground mb-2">
													{faq.question}
												</h3>
												<p className="text-muted-foreground text-sm leading-6">
													{faq.answer}
												</p>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						) : (
							<div className="prose prose-zinc max-w-none prose-sm dark:prose-invert">
								<ReactMarkdown
									components={{
										h1: ({ node, ...props }) => (
											<h1
												className="text-3xl font-bold text-foreground mb-4 mt-6"
												{...props}
											/>
										),
										h2: ({ node, ...props }) => (
											<h2
												className="text-2xl font-bold text-foreground mb-3 mt-6"
												{...props}
											/>
										),
										h3: ({ node, ...props }) => (
											<h3
												className="text-xl font-semibold text-foreground mb-2 mt-4"
												{...props}
											/>
										),
										h4: ({ node, ...props }) => (
											<h4
												className="text-lg font-semibold text-foreground mb-2 mt-3"
												{...props}
											/>
										),
										p: ({ node, ...props }) => (
											<p
												className="text-muted-foreground mb-3 leading-6 text-sm"
												{...props}
											/>
										),
										ul: ({ node, ...props }) => (
											<ul
												className="list-disc mb-3 space-y-1.5 text-muted-foreground text-sm ml-6 pl-0"
												style={{ listStylePosition: "outside" }}
												{...props}
											/>
										),
										ol: ({ node, ...props }) => (
											<ol
												className="list-decimal mb-3 space-y-1.5 text-muted-foreground text-sm ml-6 pl-0"
												style={{ listStylePosition: "outside" }}
												{...props}
											/>
										),
										li: ({ node, children, ...props }) => {
											// Always pass to FunctionListItem - it will handle detection and fallback
											return (
												<li className="mb-1.5 pl-2" {...props}>
													<FunctionListItem>{children}</FunctionListItem>
												</li>
											);
										},
										code: ({ node, inline, className, children, ...props }) => {
											const match = /language-(\w+)/.exec(className || "");
											const language = match ? match[1] : "";
											const codeString = String(children).replace(/\n$/, "");

											if (inline) {
												return (
													<code
														className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono"
														{...props}
													>
														{children}
													</code>
												);
											}

											return (
												<CodeBlock language={language} {...props}>
													{codeString}
												</CodeBlock>
											);
										},
										pre: ({ node, children, ...props }) => {
											// Pre tag is handled by CodeBlock component
											return <>{children}</>;
										},
										blockquote: ({ node, ...props }) => (
											<blockquote
												className="border-l-4 border-border pl-3 italic text-muted-foreground my-3 text-sm"
												{...props}
											/>
										),
										a: ({ node, ...props }) => (
											<a
												className="text-primary hover:underline"
												target="_blank"
												rel="noopener noreferrer"
												{...props}
											/>
										),
										strong: ({ node, ...props }) => (
											<strong
												className="font-semibold text-foreground"
												{...props}
											/>
										),
										table: ({ node, ...props }) => (
											<div className="overflow-x-auto my-4">
												<table
													className="min-w-full border border-border rounded"
													{...props}
												/>
											</div>
										),
										thead: ({ node, ...props }) => (
											<thead className="bg-muted" {...props} />
										),
										th: ({ node, ...props }) => (
											<th
												className="px-3 py-1.5 text-left font-semibold text-foreground border-b border-border text-sm"
												{...props}
											/>
										),
										td: ({ node, ...props }) => (
											<td
												className="px-3 py-1.5 text-muted-foreground border-b border-border text-sm"
												{...props}
											/>
										),
									}}
								>
									{markdownContent}
								</ReactMarkdown>
							</div>
						)}
						{/* Navigation Footer */}
						<Card className="w-fit my-10 shadow-none">
							<CardContent className="p-1 flex items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									onClick={handlePrevious}
									disabled={!hasPrevious}
									className="text-xs"
								>
									<ChevronLeft className="w-3.5 h-3.5" />
									Previous
								</Button>
								<Separator orientation="vertical" className="h-6" />
								<Button
									variant="ghost"
									size="sm"
									onClick={handleNext}
									disabled={!hasNext}
									className="text-xs"
								>
									Next
									<ChevronRight className="w-3.5 h-3.5" />
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			{/* Search Modal */}
			<Dialog
				open={showSearchModal}
				onOpenChange={(open) => {
					setShowSearchModal(open);
					if (!open) {
						setSearchQuery("");
						setSearchResults([]);
					}
				}}
			>
				<DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0">
					<DialogHeader className="p-4 border-b border-border">
						<DialogTitle className="flex items-center gap-2 font-mono">
							<Search className="w-5 h-5 text-muted-foreground" />
							Search & Ask
						</DialogTitle>
					</DialogHeader>

					<div className="p-4 border-b border-border">
						<Input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search sections, FAQs, and content..."
							className="font-mono text-sm"
							autoFocus
						/>
					</div>

					<div className="flex-1 overflow-y-auto p-4">
						{searchQuery.trim() ? (
							searchResults.length > 0 ? (
								<div className="space-y-2">
									{searchResults.map((result, index) => (
										<Button
											key={index}
											variant="outline"
											onClick={() => {
												if (result.type === "section") {
													setActiveSection(result.id);
												} else if (result.type === "faq") {
													setActiveSection("faq");
												}
												setShowSearchModal(false);
												setSearchQuery("");
												setSearchResults([]);
											}}
											className="w-full h-auto justify-start p-3 text-left"
										>
											<div className="flex items-start gap-2 w-full">
												{result.type === "faq" ? (
													<HelpCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
												) : (
													<BookOpen className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
												)}
												<div className="flex-1">
													<div className="text-sm font-semibold text-foreground font-mono">
														{result.title}
													</div>
													{result.content && (
														<div className="text-xs text-muted-foreground mt-1 line-clamp-2 font-normal">
															{result.content}
														</div>
													)}
													{result.type === "faq" && (
														<Badge variant="secondary" className="mt-1 text-xs font-normal">
															FAQ
														</Badge>
													)}
												</div>
											</div>
										</Button>
									))}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground text-sm">
									No results found for &quot;{searchQuery}&quot;
								</div>
							)
						) : (
							<div className="text-center py-8 text-muted-foreground text-sm">
								Start typing to search documentation...
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
