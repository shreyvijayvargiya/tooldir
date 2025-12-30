import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Copy,
	ChevronLeft,
	ChevronRight,
	Check,
	Github,
	Download,
	Folder,
	FolderOpen,
	File,
	ChevronDown,
	ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import Head from "next/head";
import Navbar from "../app/components/Navbar";
import Footer from "../app/components/Footer";

// Build Form Component
const BuildForm = () => {
	const [step, setStep] = useState(1);
	const [config, setConfig] = useState({
		// Step 1: Basic Info
		saasName: "",
		saasDescription: "",
		domain: "",

		// Step 2: GitHub & Vercel
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
		"README.md",
		".gitignore",
		".eslintrc.json",
		".prettierrc",
		"pages/builder.js",
		".cursor",
		"public/docs",
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

	// Remove unused imports
	// Database, Mail, CreditCard icons are no longer needed

	const generateEnvFile = () => {
		const envContent = `# ${config.saasName} - Environment Variables Template
# Generated on ${new Date().toLocaleDateString()}
# 
# Note: Add your environment keys directly to .env.local file
# These are sensitive credentials and should not be stored in the repository
#
# Required Environment Variables:
# - Firebase Configuration (NEXT_PUBLIC_FIREBASE_*)
# - Resend Email Configuration (RESEND_API_KEY, RESEND_FROM_EMAIL)
# - Stripe Payments Configuration (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
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

	const totalSteps = 2;
	const repoInfo = generateRepositoryInfo();

	return (
		<>
			<Head>
				<title>Build Your SaaS - SAAS Starter</title>
				<meta
					name="description"
					content="Configure your SaaS application and generate your repository setup"
				/>
			</Head>
			<div className="min-h-screen bg-zinc-50 flex flex-col">
				<Navbar />
				<div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
					<div className="space-y-6">
						<div>
							<h1 className="text-3xl font-bold text-zinc-900 mb-2">
								Build Your SaaS
							</h1>
							<p className="text-zinc-600 text-sm">
								Configure your SaaS application and generate your repository
								setup.
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
												setConfig({
													...config,
													saasDescription: e.target.value,
												})
											}
											placeholder="A brief description of your SaaS"
											rows={3}
											className="w-full px-3 py-2 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-500 text-sm"
										/>
									</div>
								</motion.div>
							)}

							{/* Step 2: GitHub & Vercel */}
							{step === 2 && (
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
											Files and folders to exclude from the final code
											repository bundle. One per line.
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
											Default exclusions: node_modules, .next, .git, .env files,
											and build artifacts are always excluded.
										</p>
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
												{astData.summary.totalLines.toLocaleString()} lines of
												code
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
																	projectName:
																		config.saasName || "saas-starter",
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
														toast.error(
															"Failed to download code repository ZIP"
														);
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
				</div>
				<Footer />
			</div>
		</>
	);
};

export default BuildForm;
