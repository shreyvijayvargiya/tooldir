import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
	X,
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
import { toast } from "react-toastify";
import Fuse from "fuse.js";

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
		question: "How do I set up Firebase Authentication?",
		answer:
			"To set up Firebase Authentication, go to Firebase Console, enable Email/Password and Google providers, then add your Firebase configuration to `.env.local` with all required environment variables. See the Authentication section for detailed steps.",
	},
	{
		id: 2,
		question: "How do I send emails to subscribers?",
		answer:
			"Use the Admin panel → Emails tab to create an email, then click 'Send to Subscribers'. The system will automatically batch send emails to all active subscribers using Resend API. Make sure you have configured your Resend API key in environment variables.",
	},
	{
		id: 3,
		question: "How do I configure Polar payments?",
		answer:
			"Create a Polar account, set up products and plans, get your API credentials, and add them to `.env.local`. Configure the webhook endpoint at `/api/polar/webhook`. For local testing, use ngrok to forward webhooks to your local server.",
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
			"User roles are stored in the Firestore `teams` collection, not in Firebase Auth. Add users to the teams collection with their email and role (admin, editor, author, or viewer). Roles are checked client-side and should be validated server-side for security.",
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
			"Install ngrok (`npm install -g ngrok`), start your dev server (`npm run dev`), run `ngrok http 3000` in another terminal, copy the ngrok URL, and set it as your webhook URL in Polar dashboard. Webhooks will be forwarded to your local server.",
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
			"Build the application with `npm run build`, then deploy to Vercel (recommended for Next.js) or any Node.js hosting. Make sure to set all environment variables in your hosting platform. Update Firebase Security Rules and Supabase RLS policies for production.",
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
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleCopyCode}
					className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
						copied
							? "bg-green-100 text-green-700"
							: "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
					}`}
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
				</motion.button>
			</div>
			<SyntaxHighlighter
				language={language || "javascript"}
				style={lightTheme}
				PreTag="div"
				className="rounded border border-zinc-200 !bg-white"
				customStyle={{
					background: "#ffffff",
					padding: "1rem",
					margin: 0,
					fontSize: "0.75rem",
					border: "1px solid #e4e4e7",
				}}
				{...props}
			>
				{codeString}
			</SyntaxHighlighter>
		</div>
	);
};

// Build Form Component
const BuildForm = () => {
	const [step, setStep] = useState(1);
	const [config, setConfig] = useState({
		// Step 1: Basic Info
		saasName: "",
		saasDescription: "",
		domain: "",

		// Step 2: Firebase Config
		firebase: {
			apiKey: "",
			authDomain: "",
			projectId: "",
			storageBucket: "",
			messagingSenderId: "",
			appId: "",
		},

		// Step 3: Resend Config
		resend: {
			apiKey: "",
			fromEmail: "",
		},

		// Step 4: Polar Config
		polar: {
			accessToken: "",
			apiUrl: "https://api.polar.sh",
			webhookSecret: "",
		},

		// Step 5: GitHub & Vercel
		github: {
			repoName: "",
			username: "",
		},
		vercel: {
			projectName: "",
		},
	});

	const [generatedEnv, setGeneratedEnv] = useState("");
	const [showEnvCode, setShowEnvCode] = useState(false);
	const [astData, setAstData] = useState(null);
	const [astLoading, setAstLoading] = useState(false);
	const [expandedPaths, setExpandedPaths] = useState(new Set([""])); // Root is expanded by default
	const [excludeFiles, setExcludeFiles] = useState([
		"pages/docs.js",
		"docs",
		"README.md",
		".gitignore",
		".eslintrc.json",
		".prettierrc",
	]);

	const updateConfig = (section, field, value) => {
		setConfig((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const generateEnvFile = () => {
		const envContent = `# ${config.saasName} - Environment Variables
# Generated on ${new Date().toLocaleDateString()}

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${config.firebase.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${config.firebase.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${config.firebase.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${config.firebase.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${config.firebase.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${config.firebase.appId}

# Resend Email Configuration
RESEND_API_KEY=${config.resend.apiKey}
RESEND_FROM_EMAIL=${config.resend.fromEmail}

# Polar Payments Configuration
POLAR_ACCESS_TOKEN=${config.polar.accessToken}
POLAR_API_URL=${config.polar.apiUrl}
POLAR_WEBHOOK_SECRET=${config.polar.webhookSecret}
`;
		setGeneratedEnv(envContent);
		setShowEnvCode(true);
		return envContent;
	};

	const downloadEnvFile = () => {
		const envContent = generateEnvFile();
		const blob = new Blob([envContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = ".env.local";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success(".env.local file downloaded!");
	};

	const copyEnvToClipboard = async () => {
		const envContent = generateEnvFile();
		try {
			await navigator.clipboard.writeText(envContent);
			toast.success("Environment variables copied to clipboard!");
		} catch (error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const generateRepositoryInfo = () => {
		return {
			repoUrl:
				config.github.username && config.github.repoName
					? `https://github.com/${config.github.username}/${config.github.repoName}`
					: null,
			vercelUrl: config.vercel.projectName
				? `https://${config.vercel.projectName}.vercel.app`
				: null,
		};
	};

	const fetchAST = async () => {
		setAstLoading(true);
		try {
			const response = await fetch("/api/builder/generate-ast", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					excludeFiles: excludeFiles,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate AST");
			}

			const data = await response.json();
			setAstData(data);
			toast.success("Code repository AST generated successfully!");
		} catch (error) {
			console.error("Error fetching AST:", error);
			toast.error("Failed to generate code repository AST");
		} finally {
			setAstLoading(false);
		}
	};

	const toggleExpand = (path) => {
		setExpandedPaths((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(path)) {
				newSet.delete(path);
			} else {
				newSet.add(path);
			}
			return newSet;
		});
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
	};

	// Tree View Component
	const TreeNode = ({ node, level = 0 }) => {
		const isExpanded = expandedPaths.has(node.path);
		const hasChildren =
			node.type === "directory" && node.children && node.children.length > 0;

		return (
			<div className="select-none">
				<div
					className={`flex items-center gap-2 py-1 px-2 hover:bg-zinc-50 rounded cursor-pointer ${
						level === 0 ? "font-semibold" : ""
					}`}
					style={{ paddingLeft: `${level * 16 + 8}px` }}
					onClick={() => hasChildren && toggleExpand(node.path)}
				>
					{hasChildren ? (
						isExpanded ? (
							<ChevronDown className="w-3 h-3 text-zinc-500 flex-shrink-0" />
						) : (
							<ChevronRightIcon className="w-3 h-3 text-zinc-500 flex-shrink-0" />
						)
					) : (
						<div className="w-3 h-3 flex-shrink-0" />
					)}
					{node.type === "directory" ? (
						isExpanded ? (
							<FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
						) : (
							<Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
						)
					) : (
						<File className="w-4 h-4 text-zinc-600 flex-shrink-0" />
					)}
					<span className="text-sm text-zinc-900 font-mono">{node.name}</span>
					{node.type === "file" && (
						<span className="text-xs text-zinc-500 ml-auto">
							{formatFileSize(node.size)} • {node.lines} lines
						</span>
					)}
					{node.type === "directory" && (
						<span className="text-xs text-zinc-500 ml-auto">
							{node.fileCount} files • {node.lineCount.toLocaleString()} lines
						</span>
					)}
				</div>
				{hasChildren && isExpanded && (
					<div>
						{node.children.map((child) => (
							<TreeNode key={child.path} node={child} level={level + 1} />
						))}
					</div>
				)}
			</div>
		);
	};

	const totalSteps = 5;
	const repoInfo = generateRepositoryInfo();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-zinc-900 mb-2">
					Build Your SaaS
				</h1>
				<p className="text-zinc-600 text-sm">
					Configure your SaaS application and generate your repository setup.
				</p>
			</div>

			{/* Progress Indicator */}
			<div className="bg-white border border-zinc-200 rounded-xl p-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-xs font-medium text-zinc-600">
						Step {step} of {totalSteps}
					</span>
					<span className="text-xs text-zinc-500">
						{Math.round((step / totalSteps) * 100)}% Complete
					</span>
				</div>
				<div className="w-full bg-zinc-200 rounded-full h-2">
					<motion.div
						className="bg-zinc-900 h-2 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${(step / totalSteps) * 100}%` }}
						transition={{ duration: 0.3 }}
					/>
				</div>
			</div>

			{/* Form Steps */}
			<div className="bg-white border border-zinc-200 rounded-xl p-6">
				{/* Step 1: Basic Information */}
				{step === 1 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h2 className="text-xl font-semibold text-zinc-900 mb-4">
							Basic Information
						</h2>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								SaaS Name *
							</label>
							<input
								type="text"
								value={config.saasName}
								onChange={(e) =>
									setConfig({ ...config, saasName: e.target.value })
								}
								placeholder="My Awesome SaaS"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Description
							</label>
							<textarea
								value={config.saasDescription}
								onChange={(e) =>
									setConfig({ ...config, saasDescription: e.target.value })
								}
								placeholder="A brief description of your SaaS"
								rows={3}
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Domain (Optional)
							</label>
							<input
								type="text"
								value={config.domain}
								onChange={(e) =>
									setConfig({ ...config, domain: e.target.value })
								}
								placeholder="your-saas.com"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
					</motion.div>
				)}

				{/* Step 2: Firebase Configuration */}
				{step === 2 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
							<Database className="w-5 h-5" />
							Firebase Configuration
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									API Key *
								</label>
								<input
									type="text"
									value={config.firebase.apiKey}
									onChange={(e) =>
										updateConfig("firebase", "apiKey", e.target.value)
									}
									placeholder="AIza..."
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									Auth Domain *
								</label>
								<input
									type="text"
									value={config.firebase.authDomain}
									onChange={(e) =>
										updateConfig("firebase", "authDomain", e.target.value)
									}
									placeholder="project.firebaseapp.com"
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									Project ID *
								</label>
								<input
									type="text"
									value={config.firebase.projectId}
									onChange={(e) =>
										updateConfig("firebase", "projectId", e.target.value)
									}
									placeholder="my-project-id"
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									Storage Bucket *
								</label>
								<input
									type="text"
									value={config.firebase.storageBucket}
									onChange={(e) =>
										updateConfig("firebase", "storageBucket", e.target.value)
									}
									placeholder="project.appspot.com"
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									Messaging Sender ID *
								</label>
								<input
									type="text"
									value={config.firebase.messagingSenderId}
									onChange={(e) =>
										updateConfig(
											"firebase",
											"messagingSenderId",
											e.target.value
										)
									}
									placeholder="123456789"
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-900 mb-1">
									App ID *
								</label>
								<input
									type="text"
									value={config.firebase.appId}
									onChange={(e) =>
										updateConfig("firebase", "appId", e.target.value)
									}
									placeholder="1:123456789:web:abc123"
									className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
								/>
							</div>
						</div>
					</motion.div>
				)}

				{/* Step 3: Resend Configuration */}
				{step === 3 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
							<Mail className="w-5 h-5" />
							Resend Email Configuration
						</h2>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Resend API Key *
							</label>
							<input
								type="password"
								value={config.resend.apiKey}
								onChange={(e) =>
									updateConfig("resend", "apiKey", e.target.value)
								}
								placeholder="re_..."
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								From Email *
							</label>
							<input
								type="email"
								value={config.resend.fromEmail}
								onChange={(e) =>
									updateConfig("resend", "fromEmail", e.target.value)
								}
								placeholder="noreply@yourdomain.com"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
					</motion.div>
				)}

				{/* Step 4: Polar Configuration */}
				{step === 4 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
							<CreditCard className="w-5 h-5" />
							Polar Payments Configuration
						</h2>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Polar Access Token *
							</label>
							<input
								type="password"
								value={config.polar.accessToken}
								onChange={(e) =>
									updateConfig("polar", "accessToken", e.target.value)
								}
								placeholder="polar_..."
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Polar API URL
							</label>
							<input
								type="text"
								value={config.polar.apiUrl}
								onChange={(e) =>
									updateConfig("polar", "apiUrl", e.target.value)
								}
								placeholder="https://api.polar.sh"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Webhook Secret *
							</label>
							<input
								type="password"
								value={config.polar.webhookSecret}
								onChange={(e) =>
									updateConfig("polar", "webhookSecret", e.target.value)
								}
								placeholder="your-webhook-secret"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
					</motion.div>
				)}

				{/* Step 5: GitHub & Vercel */}
				{step === 5 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h2 className="text-xl font-semibold text-zinc-900 mb-4 flex items-center gap-2">
							<Github className="w-5 h-5" />
							Repository & Deployment
						</h2>

						{/* Exclude Files Configuration */}
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-2">
								Exclude Files/Folders from Code Bundle
							</label>
							<p className="text-xs text-zinc-600 mb-2">
								Files and folders to exclude from the final code repository
								bundle. One per line.
							</p>
							<textarea
								value={excludeFiles.join("\n")}
								onChange={(e) => {
									const lines = e.target.value
										.split("\n")
										.filter((line) => line.trim());
									setExcludeFiles(lines);
								}}
								placeholder="pages/docs.js&#10;docs&#10;README.md"
								rows={6}
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm font-mono"
							/>
							<p className="text-xs text-zinc-500 mt-1">
								Default exclusions: node_modules, .next, .git, .env files, and
								build artifacts are always excluded.
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								GitHub Username *
							</label>
							<input
								type="text"
								value={config.github.username}
								onChange={(e) =>
									updateConfig("github", "username", e.target.value)
								}
								placeholder="your-username"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Repository Name *
							</label>
							<input
								type="text"
								value={config.github.repoName}
								onChange={(e) =>
									updateConfig("github", "repoName", e.target.value)
								}
								placeholder="my-saas-app"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-zinc-900 mb-1">
								Vercel Project Name *
							</label>
							<input
								type="text"
								value={config.vercel.projectName}
								onChange={(e) =>
									updateConfig("vercel", "projectName", e.target.value)
								}
								placeholder="my-saas-app"
								className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
							/>
						</div>
					</motion.div>
				)}

				{/* Navigation Buttons */}
				<div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-200">
					<button
						onClick={() => setStep(Math.max(1, step - 1))}
						disabled={step === 1}
						className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium ${
							step === 1
								? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
								: "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
						}`}
					>
						<ChevronLeft className="w-4 h-4" />
						Previous
					</button>
					{step < totalSteps ? (
						<button
							onClick={() => setStep(Math.min(totalSteps, step + 1))}
							className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors text-sm font-medium"
						>
							Next
							<ChevronRight className="w-4 h-4" />
						</button>
					) : (
						<button
							onClick={async () => {
								generateEnvFile();
								setShowEnvCode(true);
								await fetchAST();
							}}
							disabled={astLoading}
							className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{astLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
									Generating...
								</>
							) : (
								<>
									<Check className="w-4 h-4" />
									Generate Configuration
								</>
							)}
						</button>
					)}
				</div>
			</div>

			{/* Code Repository AST Tree */}
			{showEnvCode && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
				>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-semibold text-zinc-900">
								Code Repository Structure
							</h2>
							{astData?.summary && (
								<p className="text-sm text-zinc-600 mt-1">
									{astData.summary.totalFiles} files •{" "}
									{astData.summary.totalDirectories} directories •{" "}
									{astData.summary.totalLines.toLocaleString()} lines of code
								</p>
							)}
						</div>
						{astData && (
							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										navigator.clipboard.writeText(
											JSON.stringify(astData.ast, null, 2)
										);
										toast.success("AST JSON copied to clipboard!");
									}}
									className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors text-xs font-medium"
								>
									<Copy className="w-3.5 h-3.5" />
									Copy AST JSON
								</button>
								<button
									onClick={async () => {
										try {
											const response = await fetch(
												"/api/builder/download-zip",
												{
													method: "POST",
													headers: {
														"Content-Type": "application/json",
													},
													body: JSON.stringify({
														excludeFiles: excludeFiles,
														projectName: config.saasName || "saas-starter",
													}),
												}
											);

											if (!response.ok) {
												throw new Error("Failed to generate zip file");
											}

											// Get the blob from response
											const blob = await response.blob();

											// Create download link
											const url = window.URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = `${
												config.saasName || "saas-starter"
											}-${Date.now()}.zip`;
											document.body.appendChild(a);
											a.click();
											document.body.removeChild(a);
											window.URL.revokeObjectURL(url);

											toast.success("Code repository ZIP downloaded!");
										} catch (error) {
											console.error("Error downloading zip:", error);
											toast.error("Failed to download code repository ZIP");
										}
									}}
									className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors text-xs font-medium"
								>
									<Download className="w-3.5 h-3.5" />
									Download ZIP
								</button>
							</div>
						)}
					</div>
					{astLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="flex flex-col items-center gap-3">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
								<p className="text-sm text-zinc-600">
									Generating code repository AST...
								</p>
							</div>
						</div>
					) : astData?.ast ? (
						<div className="border border-zinc-200 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
							<TreeNode node={astData.ast} />
						</div>
					) : (
						<div className="text-center py-8 text-zinc-500 text-sm">
							Click "Generate Configuration" to view the code repository
							structure
						</div>
					)}
				</motion.div>
			)}
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
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
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
						className={`flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium transition-all ${
							copied
								? "bg-green-100 text-green-700 opacity-100"
								: "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 opacity-0 group-hover/item:opacity-100"
						}`}
					>
						{copied ? (
							<Check className="w-3 h-3" />
						) : (
							<Copy className="w-3 h-3" />
						)}
					</motion.button>
					<div className="flex-1">
						<code className="text-zinc-900 font-mono text-xs font-semibold bg-zinc-100 px-1 py-0.5 rounded">
							{functionInfo.functionName}
						</code>
						<span className="text-zinc-700 text-sm ml-1">
							: {functionInfo.description}
						</span>
					</div>
				</div>
			);
		}

		return <>{children}</>;
	};

	return (
		<div className="min-h-screen bg-zinc-50 flex">
			{/* Sidebar */}
			<aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col h-screen sticky top-0 font-mono">
				<div className="p-4 border-b border-zinc-200">
					<div className="flex items-center gap-2">
						<RocketIcon className="w-5 h-5 text-zinc-900" />
						<h1 className="text-lg font-bold text-zinc-900 font-mono">
							SAAS Starter
						</h1>
					</div>
				</div>
				<nav className="flex-1 overflow-y-auto p-3">
					{/* Search Button */}
					<button
						onClick={() => setShowSearchModal(true)}
						className="w-full px-3 py-1.5 mb-2 text-xs font-medium transition-colors rounded flex items-center justify-between bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border border-zinc-300 font-mono"
					>
						<div className="flex items-center gap-2">
							<Search className="w-3.5 h-3.5" />
							<span>Search</span>
						</div>
						<span className="text-[10px] text-zinc-500">CMD/CTRL + K</span>
					</button>
					<ul className="space-y-0.5">
						{DOC_SECTIONS.map((section) => {
							const IconComponent = section.icon;
							return (
								<li key={section.id}>
									<button
										onClick={() => setActiveSection(section.id)}
										className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors font-mono flex items-center gap-2 ${
											activeSection === section.id
												? "bg-zinc-100 text-zinc-900"
												: "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
										}`}
									>
										<IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
										<span>{section.title}</span>
									</button>
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
					<h2 className="text-xl font-bold text-zinc-900">
						{DOC_SECTIONS.find((s) => s.id === activeSection)?.title ||
							"Documentation"}
					</h2>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={handleCopyMarkdown}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors text-xs font-medium"
					>
						<Copy className="w-3.5 h-3.5" />
						Copy Markdown
					</motion.button>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-y-auto">
					<div className="max-w-4xl mx-auto px-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-20">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
							</div>
						) : activeSection === "faq" ? (
							<div className="space-y-6">
								<h1 className="text-3xl font-bold text-zinc-900 mb-6">
									Frequently Asked Questions
								</h1>
								<div className="space-y-4">
									{FAQ_DATA.map((faq) => (
										<div
											key={faq.id}
											className="bg-white border border-zinc-200 rounded p-4"
										>
											<h3 className="text-lg font-semibold text-zinc-900 mb-2">
												{faq.question}
											</h3>
											<p className="text-zinc-700 text-sm leading-6">
												{faq.answer}
											</p>
										</div>
									))}
								</div>
							</div>
						) : activeSection === "build" ? (
							<BuildForm />
						) : (
							<div className="prose prose-zinc max-w-none prose-sm">
								<ReactMarkdown
									components={{
										h1: ({ node, ...props }) => (
											<h1
												className="text-3xl font-bold text-zinc-900 mb-4 mt-6"
												{...props}
											/>
										),
										h2: ({ node, ...props }) => (
											<h2
												className="text-2xl font-bold text-zinc-900 mb-3 mt-6"
												{...props}
											/>
										),
										h3: ({ node, ...props }) => (
											<h3
												className="text-xl font-semibold text-zinc-900 mb-2 mt-4"
												{...props}
											/>
										),
										h4: ({ node, ...props }) => (
											<h4
												className="text-lg font-semibold text-zinc-900 mb-2 mt-3"
												{...props}
											/>
										),
										p: ({ node, ...props }) => (
											<p
												className="text-zinc-700 mb-3 leading-6 text-sm"
												{...props}
											/>
										),
										ul: ({ node, ...props }) => (
											<ul
												className="list-disc mb-3 space-y-1.5 text-zinc-700 text-sm ml-6 pl-0"
												style={{ listStylePosition: "outside" }}
												{...props}
											/>
										),
										ol: ({ node, ...props }) => (
											<ol
												className="list-decimal mb-3 space-y-1.5 text-zinc-700 text-sm ml-6 pl-0"
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
														className="text-zinc-900 px-1 py-0.5 rounded text-xs font-mono"
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
												className="border-l-4 border-zinc-300 pl-3 italic text-zinc-600 my-3 text-sm"
												{...props}
											/>
										),
										a: ({ node, ...props }) => (
											<a
												className="text-blue-600 hover:text-blue-800 underline"
												target="_blank"
												rel="noopener noreferrer"
												{...props}
											/>
										),
										strong: ({ node, ...props }) => (
											<strong
												className="font-semibold text-zinc-900"
												{...props}
											/>
										),
										table: ({ node, ...props }) => (
											<div className="overflow-x-auto my-4">
												<table
													className="min-w-full border border-zinc-200 rounded"
													{...props}
												/>
											</div>
										),
										thead: ({ node, ...props }) => (
											<thead className="bg-zinc-100" {...props} />
										),
										th: ({ node, ...props }) => (
											<th
												className="px-3 py-1.5 text-left font-semibold text-zinc-900 border-b border-zinc-200 text-sm"
												{...props}
											/>
										),
										td: ({ node, ...props }) => (
											<td
												className="px-3 py-1.5 text-zinc-700 border-b border-zinc-200 text-sm"
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
						<div className="w-fit my-10 p-1 bg-white gap-1 rounded flex items-center justify-around">
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handlePrevious}
								disabled={!hasPrevious}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-xs font-medium ${
									hasPrevious
										? "bg-zinc-100/50 hover:bg-zinc-100 text-zinc-700"
										: "bg-zinc-50 text-zinc-400 cursor-not-allowed"
								}`}
							>
								<ChevronLeft className="w-3.5 h-3.5" />
								Previous
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleNext}
								disabled={!hasNext}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors text-xs font-medium ${
									hasNext
										? "bg-zinc-100/50 hover:bg-zinc-100 text-zinc-700"
										: "bg-zinc-50 text-zinc-400 cursor-not-allowed"
								}`}
							>
								Next
								<ChevronRight className="w-3.5 h-3.5" />
							</motion.button>
						</div>
					</div>
				</div>
			</main>

			{/* Search Modal */}
			<AnimatePresence>
				{showSearchModal && (
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4"
						onClick={() => {
							setShowSearchModal(false);
							setSearchQuery("");
							setSearchResults([]);
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: -20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: -20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-white rounded shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
						>
							{/* Modal Header */}
							<div className="p-4 border-b border-zinc-200 flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Search className="w-5 h-5 text-zinc-600" />
									<h3 className="text-lg font-semibold text-zinc-900 font-mono">
										Search & Ask
									</h3>
								</div>
								<button
									onClick={() => {
										setShowSearchModal(false);
										setSearchQuery("");
										setSearchResults([]);
									}}
									className="p-1 hover:bg-zinc-100 rounded transition-colors"
								>
									<X className="w-5 h-5 text-zinc-600" />
								</button>
							</div>

							{/* Search Input */}
							<div className="p-4 border-b border-zinc-200">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search sections, FAQs, and content..."
									className="w-full px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm font-mono"
									autoFocus
								/>
							</div>

							{/* Search Results */}
							<div className="flex-1 overflow-y-auto p-4">
								{searchQuery.trim() ? (
									searchResults.length > 0 ? (
										<div className="space-y-2">
											{searchResults.map((result, index) => (
												<motion.button
													key={index}
													whileHover={{ scale: 1.01 }}
													whileTap={{ scale: 0.99 }}
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
													className="w-full text-left p-3 bg-zinc-50 hover:bg-zinc-100 rounded transition-colors border border-zinc-200"
												>
													<div className="flex items-start gap-2">
														{result.type === "faq" ? (
															<HelpCircle className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
														) : (
															<BookOpen className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
														)}
														<div className="flex-1">
															<div className="text-sm font-semibold text-zinc-900 font-mono">
																{result.title}
															</div>
															{result.content && (
																<div className="text-xs text-zinc-600 mt-1 line-clamp-2">
																	{result.content}
																</div>
															)}
															{result.type === "faq" && (
																<div className="text-xs text-zinc-500 mt-1">
																	FAQ
																</div>
															)}
														</div>
													</div>
												</motion.button>
											))}
										</div>
									) : (
										<div className="text-center py-8 text-zinc-500 text-sm">
											No results found for "{searchQuery}"
										</div>
									)
								) : (
									<div className="text-center py-8 text-zinc-500 text-sm">
										Start typing to search documentation...
									</div>
								)}
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
}
