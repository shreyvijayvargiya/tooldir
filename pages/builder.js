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
	FileText,
	Mail,
	User,
	Users,
	ShoppingBag,
	CreditCard,
	MessageSquare,
	Home,
	X,
} from "lucide-react";
import { toast } from "react-toastify";
import Head from "next/head";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";

import {
	MODULES,
	getSelectableModules,
	getEnvVarsForModules,
} from "../lib/config/modules-config";

// Icon mapping for modules
const MODULE_ICONS = {
	FileText: FileText,
	Mail: Mail,
	User: User,
	Users: Users,
	ShoppingBag: ShoppingBag,
	CreditCard: CreditCard,
	MessageSquare: MessageSquare,
	Home: Home,
};

// Build Form Component
const BuildForm = () => {
	const [step, setStep] = useState(1);
	const [config, setConfig] = useState({
		// Step 1: Basic Info
		saasName: "",
		saasDescription: "",
		domain: "",

		// Step 2: Module Selection
		selectedModules: [],

		// Step 3: GitHub & Vercel
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
	const [selectedFile, setSelectedFile] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [fileLoading, setFileLoading] = useState(false);
	const [useAIGeneration, setUseAIGeneration] = useState(true); // Default to AI-powered
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

	const toggleModule = (moduleKey) => {
		setConfig((prev) => {
			const currentModules = prev.selectedModules || [];
			if (currentModules.includes(moduleKey)) {
				return {
					...prev,
					selectedModules: currentModules.filter((m) => m !== moduleKey),
				};
			} else {
				return {
					...prev,
					selectedModules: [...currentModules, moduleKey],
				};
			}
		});
	};

	const generateEnvFile = () => {
		const envVars = getEnvVarsForModules(config.selectedModules || []);

		const envContent = `# ${config.saasName} - Environment Variables Template
# Generated on ${new Date().toLocaleDateString()}
# 
# Note: Add your environment keys directly to .env.local file
# These are sensitive credentials and should not be stored in the repository
#
# Required Environment Variables:
# - Supabase Configuration (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_KEY)
${envVars.length > 0 ? `# - Module-specific variables:\n${envVars.map((v) => `#   ${v}`).join("\n")}` : "# - No additional module-specific variables required"}
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

	const fetchAST = async (useAI = false) => {
		setAstLoading(true);
		try {
			// First, get the original AST
			const originalResponse = await fetch("/api/builder/generate-ast", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					excludeFiles: excludeFiles,
					selectedModules: [], // Get full AST first
				}),
			});

			if (!originalResponse.ok) {
				throw new Error("Failed to generate original AST");
			}

			const originalData = await originalResponse.json();

			// If AI is enabled, use AI to filter the AST
			if (useAI) {
				const aiResponse = await fetch("/api/builder/generate-ast-ai", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						originalAST: originalData.ast,
						selectedModules: config.selectedModules || [],
						projectName: config.saasName || "saas-starter",
						excludeFiles: excludeFiles,
					}),
				});

				if (!aiResponse.ok) {
					throw new Error("Failed to generate AI-powered AST");
				}

				const aiData = await aiResponse.json();
				setAstData(aiData);
				toast.success("AI-powered code repository AST generated successfully!");
			} else {
				// Use traditional filtering
				const response = await fetch("/api/builder/generate-ast", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						excludeFiles: excludeFiles,
						selectedModules: config.selectedModules || [],
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to generate AST");
				}

				const data = await response.json();
				setAstData(data);
				toast.success("Code repository AST generated successfully!");
			}
		} catch (error) {
			console.error("Error fetching AST:", error);
			toast.error(
				useAI
					? "Failed to generate AI-powered AST. Falling back to traditional method."
					: "Failed to generate code repository AST"
			);

			// Fallback to traditional method if AI fails
			if (useAI) {
				try {
					const response = await fetch("/api/builder/generate-ast", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							excludeFiles: excludeFiles,
							selectedModules: config.selectedModules || [],
						}),
					});

					if (response.ok) {
						const data = await response.json();
						setAstData(data);
						toast.info("Using traditional AST generation method");
					}
				} catch (fallbackError) {
					console.error("Fallback AST generation also failed:", fallbackError);
				}
			}
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

	const handleFileClick = async (filePath) => {
		if (selectedFile === filePath && fileContent) {
			return; // Already loaded
		}

		setSelectedFile(filePath);
		setFileLoading(true);
		setFileContent(null);

		try {
			const response = await fetch("/api/builder/get-file-content", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ filePath }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Failed to load file");
			}

			const data = await response.json();
			setFileContent(data);
		} catch (error) {
			console.error("Error loading file:", error);
			toast.error(error.message || "Failed to load file content");
			setSelectedFile(null);
		} finally {
			setFileLoading(false);
		}
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
		const isSelected = selectedFile === node.path && node.type === "file";

		return (
			<div className="select-none">
				<div
					className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors ${
						isSelected
							? "bg-zinc-50 text-zinc-900"
							: "hover:bg-zinc-50 text-zinc-900"
					} ${level === 0 ? "font-semibold" : ""}`}
					style={{ paddingLeft: `${level * 16 + 8}px` }}
					onClick={() => {
						if (node.type === "file") {
							handleFileClick(node.path);
						} else if (hasChildren) {
							toggleExpand(node.path);
						}
					}}
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
					<span className={`text-sm font-mono text-zinc-900`}>{node.name}</span>
					{node.type === "file" && (
						<span className={`text-xs ml-auto text-zinc-900`}>
							{formatFileSize(node.size)} • {node.lines} lines
						</span>
					)}
					{node.type === "directory" && (
						<span className={`text-xs ml-auto text-zinc-900`}>
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

	const totalSteps = 3;
	const selectableModules = getSelectableModules();

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

							{/* Step 2: Module Selection */}
							{step === 2 && (
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									className="space-y-4"
								>
									<div className="flex items-center justify-between mb-4">
										<div>
											<h2 className="text-xl font-semibold text-zinc-900">
												Select Features & Modules
											</h2>
											<p className="text-sm text-zinc-600 mt-1">
												Choose which features you want to include in your SaaS
												application. Only selected modules and their
												dependencies will be included in the generated code
												repository.
											</p>
										</div>
										<button
											onClick={() => {
												const allSelected =
													config.selectedModules?.length ===
													selectableModules.length;
												if (allSelected) {
													// Deselect all
													setConfig((prev) => ({
														...prev,
														selectedModules: [],
													}));
												} else {
													// Select all
													setConfig((prev) => ({
														...prev,
														selectedModules: [...selectableModules],
													}));
												}
											}}
											className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl transition-colors text-sm font-medium whitespace-nowrap"
										>
											<Check className="w-4 h-4" />
											{config.selectedModules?.length ===
											selectableModules.length
												? "Deselect All"
												: "Select All"}
										</button>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										{selectableModules.map((moduleKey) => {
											const module = MODULES[moduleKey];
											const IconComponent =
												MODULE_ICONS[module.icon] || FileText;
											const isSelected =
												config.selectedModules?.includes(moduleKey) || false;

											return (
												<motion.button
													key={moduleKey}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={() => toggleModule(moduleKey)}
													className={`p-4 border-2 rounded-xl text-left transition-all ${
														isSelected
															? "border-zinc-900 bg-zinc-50"
															: "border-zinc-200 hover:border-zinc-300"
													}`}
												>
													<div className="flex items-start gap-3">
														<div
															className={`p-2 rounded-xl ${
																isSelected
																	? "bg-zinc-900 text-white"
																	: "bg-zinc-100 text-zinc-600"
															}`}
														>
															<IconComponent className="w-5 h-5" />
														</div>
														<div className="flex-1">
															<div className="flex items-center gap-2 mb-1">
																<h3 className="font-semibold text-zinc-900">
																	{module.name}
																</h3>
																{isSelected && (
																	<Check className="w-4 h-4 text-zinc-900" />
																)}
															</div>
															<p className="text-xs text-zinc-600">
																{module.description}
															</p>
															{module.dependencies &&
																module.dependencies.length > 0 && (
																	<p className="text-xs text-zinc-500 mt-1">
																		Requires:{" "}
																		{module.dependencies
																			.map((dep) => MODULES[dep]?.name)
																			.join(", ")}
																	</p>
																)}
														</div>
													</div>
												</motion.button>
											);
										})}
									</div>

									{config.selectedModules?.length > 0 && (
										<div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
											<p className="text-xs font-medium text-zinc-700 mb-1">
												Selected Modules ({config.selectedModules.length}):
											</p>
											<p className="text-xs text-zinc-600">
												{config.selectedModules
													.map((key) => MODULES[key]?.name)
													.join(", ")}
											</p>
										</div>
									)}
								</motion.div>
							)}

							{/* Step 3: GitHub & Vercel */}
							{step === 3 && (
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
							<div className="flex items-center justify-start gap-2 mt-6 pt-6 border-t border-zinc-200">
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
											await fetchAST(useAIGeneration);
										}}
										disabled={astLoading}
										className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{astLoading ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												{useAIGeneration ? "AI Generating..." : "Generating..."}
											</>
										) : (
											<>
												<Check className="w-4 h-4" />
												{useAIGeneration
													? "Generate with AI"
													: "Generate Configuration"}
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
																	selectedModules: config.selectedModules || [],
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
									<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
										{/* Left: File Tree */}
										<div className="border border-zinc-200 rounded-xl overflow-hidden max-h-[600px] overflow-y-auto">
											<TreeNode node={astData.ast} />
										</div>

										{/* Right: Code Viewer */}
										<div className="border border-zinc-200 rounded-xl overflow-hidden max-h-[600px] flex flex-col">
											{fileLoading ? (
												<div className="flex items-center justify-center h-full">
													<div className="flex flex-col items-center gap-3">
														<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900"></div>
														<p className="text-sm text-zinc-600">
															Loading file...
														</p>
													</div>
												</div>
											) : fileContent ? (
												<>
													{/* File Header */}
													<div className="flex items-center justify-between p-3 bg-zinc-50 border-b border-zinc-200">
														<div className="flex items-center gap-2 flex-1 min-w-0">
															<File className="w-4 h-4 text-zinc-600 flex-shrink-0" />
															<span className="text-sm font-mono text-zinc-900 truncate">
																{fileContent.path}
															</span>
														</div>
														<button
															onClick={() => {
																setSelectedFile(null);
																setFileContent(null);
															}}
															className="p-1 hover:bg-zinc-200 rounded transition-colors"
														>
															<X className="w-4 h-4 text-zinc-600" />
														</button>
													</div>

													{/* Code Content */}
													<div className="flex-1 overflow-auto bg-white">
														<SyntaxHighlighter
															language={fileContent.language || "text"}
															style={oneLight}
															PreTag="div"
															className="!m-0 !bg-white"
															customStyle={{
																padding: "1rem",
																margin: 0,
																fontSize: "0.75rem",
																lineHeight: "1.5",
															}}
															showLineNumbers
														>
															{fileContent.content}
														</SyntaxHighlighter>
													</div>

													{/* Footer Actions */}
													<div className="p-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2">
														<button
															onClick={async () => {
																try {
																	await navigator.clipboard.writeText(
																		fileContent.content
																	);
																	toast.success(
																		"File content copied to clipboard!"
																	);
																} catch (error) {
																	toast.error("Failed to copy file content");
																}
															}}
															className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 rounded transition-colors"
														>
															<Copy className="w-3 h-3" />
															Copy Code
														</button>
													</div>
												</>
											) : (
												<div className="flex items-center justify-center h-full text-center p-8">
													<div className="text-zinc-500">
														<File className="w-12 h-12 mx-auto mb-3 opacity-50" />
														<p className="text-sm font-medium mb-1">
															No file selected
														</p>
														<p className="text-xs">
															Click on a file in the tree to view its code
														</p>
													</div>
												</div>
											)}
										</div>
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
			</div>
		</>
	);
};

export default BuildForm;
