/**
 * Module Configuration
 * Maps each feature module to its associated files, components, and dependencies
 */

export const MODULES = {
	blog: {
		name: "Blog",
		description: "Blog management system with rich text editor",
		icon: "FileText",
		files: {
			admin: [
				"app/admin/components/BlogTab.jsx",
				"app/admin/components/TiptapEditor.jsx",
			],
			pages: [
				"pages/blog.js",
				"pages/blog/[slug].js",
				"pages/blog/id/[id].js",
				"pages/admin/editor/blog.jsx",
			],
			api: [
				"lib/api/blog.js",
				"lib/api/upload.js", // Upload utility for blog images
			],
			utils: [],
		},
		dependencies: ["home"], // Blog depends on home (dashboard)
		envVars: [],
	},
	email: {
		name: "Email",
		description: "Email campaign management and sending",
		icon: "Mail",
		files: {
			admin: ["app/admin/components/EmailTab.jsx"],
			pages: ["pages/admin/editor/email.jsx"],
			api: [
				"lib/api/emails.js",
				"lib/api/subscriptionEmails.js",
				"pages/api/emails/send.js",
				"pages/api/emails/send-single.js",
				"pages/api/emails/send-to-users.js",
			],
			utils: [],
		},
		dependencies: ["home"],
		envVars: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
	},
	subscribers: {
		name: "Subscribers",
		description: "Email subscriber management",
		icon: "User",
		files: {
			admin: ["app/admin/components/SubscribersTab.jsx"],
			pages: [],
			api: ["lib/api/subscribers.js"],
			utils: [],
		},
		dependencies: ["home", "email"], // Subscribers depends on email
		envVars: [],
	},
	users: {
		name: "Users",
		description: "User management and authentication",
		icon: "Users",
		files: {
			admin: ["app/admin/components/UsersTab.jsx"],
			pages: [],
			api: ["lib/api/users.js", "lib/api/auth.js", "lib/api/teams.js"],
			utils: ["lib/utils/getUserRole.js", "lib/utils/getCurrentUserEmail.js"],
		},
		dependencies: ["home"],
		envVars: [],
	},
	customers: {
		name: "Customers",
		description: "Customer and subscription management",
		icon: "ShoppingBag",
		files: {
			admin: ["app/admin/components/CustomersTab.jsx"],
			pages: [],
			api: ["lib/api/customers.js"],
		},
		dependencies: ["home", "payments"], // Customers depends on payments
	},
	payments: {
		name: "Payments",
		description: "Payment processing with stripe integration",
		icon: "CreditCard",
		files: {
			admin: ["app/admin/components/PaymentsTab.jsx"],
			pages: ["pages/pricing.js"],
			api: [
				"lib/api/payments.js",
				"lib/api/subscriptionEmails.js", // Payment-related emails
				"pages/api/stripe/checkout.js",
				"pages/api/stripe/cancel-subscription.js",
				"pages/api/stripe/webhook.js",
			],
			utils: [
				"lib/utils/getStripe.js"
			],
		},
		dependencies: ["home", "email"], // Payments uses email for subscription notifications
		envVars: [
			"STRIPE_SECRET_KEY",
			"STRIPE_WEBHOOK_SECRET",
			"RESEND_API_KEY", // Needed for subscription emails
			"RESEND_FROM_EMAIL",
		],
	},
	messages: {
		name: "Messages",
		description: "Contact form message management",
		icon: "MessageSquare",
		files: {
			admin: ["app/admin/components/MessagesTab.jsx"],
			pages: ["pages/contact.js"],
			api: [
				"lib/api/messages.js",
				"pages/api/messages/create.js",
				"pages/api/messages/reply.js",
			],
			utils: [],
		},
		dependencies: ["home"],
		envVars: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
	},
	home: {
		name: "Home Dashboard",
		description: "Admin dashboard with statistics (always included)",
		icon: "Home",
		files: {
			admin: ["app/admin/components/HomeTab.jsx"],
			pages: [],
			api: [],
			utils: [],
		},
		dependencies: [],
		envVars: [],
		required: true, // Home is always required
	},
};

/**
 * Get all files for selected modules (including dependencies)
 */
export function getFilesForModules(selectedModules) {
	const files = {
		admin: [],
		pages: [],
		api: [],
		utils: [],
	};

	// Always include home module
	const modulesToInclude = new Set(["home", ...selectedModules]);

	// Resolve dependencies
	const resolvedModules = new Set();
	function resolveDependencies(moduleKey) {
		if (resolvedModules.has(moduleKey)) return;

		const module = MODULES[moduleKey];
		if (!module) return;

		// Add dependencies first
		if (module.dependencies) {
			module.dependencies.forEach((dep) => {
				if (modulesToInclude.has(dep) || MODULES[dep]?.required) {
					resolveDependencies(dep);
				}
			});
		}

		resolvedModules.add(moduleKey);

		// Add module files
		if (module.files) {
			Object.keys(module.files).forEach((category) => {
				if (module.files[category]) {
					files[category].push(...module.files[category]);
				}
			});
		}
	}

	// Resolve all selected modules
	modulesToInclude.forEach((moduleKey) => {
		resolveDependencies(moduleKey);
	});

	// Remove duplicates
	Object.keys(files).forEach((category) => {
		files[category] = [...new Set(files[category])];
	});

	return files;
}

/**
 * Get environment variables for selected modules
 */
export function getEnvVarsForModules(selectedModules) {
	const envVars = new Set();

	// Always include home module
	const modulesToInclude = new Set(["home", ...selectedModules]);

	modulesToInclude.forEach((moduleKey) => {
		const module = MODULES[moduleKey];
		if (module?.envVars) {
			module.envVars.forEach((envVar) => envVars.add(envVar));
		}
	});

	return Array.from(envVars);
}

/**
 * Get all module keys except required ones
 */
export function getSelectableModules() {
	return Object.keys(MODULES).filter((key) => !MODULES[key].required);
}

/**
 * Get core components that need conditional generation
 */
export function getComponentsToGenerate(selectedModules) {
	return {
		footer: true, // Always generate Footer (may remove newsletter section)
		blog: selectedModules.includes("blog"), // Only generate if blog selected
		searchModal: true, // Always generate SearchModal (filter based on modules)
		adminIndex: true, // Always generate admin index (filter tabs)
	};
}

/**
 * Get admin tab imports and components for selected modules
 */
export function getAdminTabConfig(selectedModules) {
	const modulesToInclude = new Set(["home", ...selectedModules]);
	const tabs = [];
	const imports = [];
	const tabButtons = [];
	const tabContent = [];

	// Map module keys to their tab configuration
	const tabMap = {
		home: {
			import: "import HomeTab from './components/HomeTab';",
			icon: "Home",
			label: "Home",
			tabKey: "home",
			component: '{activeTab === "home" && <HomeTab />}',
			button: `onClick={() => setActiveTab("home")}`,
		},
		blog: {
			import: "import BlogTab from './components/BlogTab';",
			icon: "FileText",
			label: "Blogs",
			tabKey: "blogs",
			component: '{activeTab === "blogs" && <BlogTab />}',
			button: `onClick={() => setActiveTab("blogs")}`,
		},
		email: {
			import: "import EmailTab from './components/EmailTab';",
			icon: "Mail",
			label: "Emails",
			tabKey: "emails",
			component:
				'{activeTab === "emails" && <EmailTab onSendEmail={handleSendEmail} />}',
			button: `onClick={() => setActiveTab("emails")}`,
		},
		subscribers: {
			import: "import SubscribersTab from './components/SubscribersTab';",
			icon: "User",
			label: "Email Subscribers",
			tabKey: "subscribers",
			component:
				'{activeTab === "subscribers" && <SubscribersTab onSendEmail={handleSendEmail} />}',
			button: `onClick={() => setActiveTab("subscribers")}`,
		},
		users: {
			import: "import UsersTab from './components/UsersTab';",
			icon: "Users",
			label: "Users",
			tabKey: "users",
			component:
				'{activeTab === "users" && <UsersTab onSendEmailToUsers={handleSendEmailToUsers} />}',
			button: `onClick={() => setActiveTab("users")}`,
		},
		customers: {
			import: "import CustomersTab from './components/CustomersTab';",
			icon: "Users",
			label: "Customers",
			tabKey: "customers",
			component: '{activeTab === "customers" && <CustomersTab />}',
			button: `onClick={() => setActiveTab("customers")}`,
		},
		payments: {
			import: "import PaymentsTab from './components/PaymentsTab';",
			icon: "CreditCard",
			label: "Payments",
			tabKey: "payments",
			component: '{activeTab === "payments" && <PaymentsTab />}',
			button: `onClick={() => setActiveTab("payments")}`,
		},
		messages: {
			import: "import MessagesTab from './components/MessagesTab';",
			icon: "MessageSquare",
			label: "Messages",
			tabKey: "messages",
			component: '{activeTab === "messages" && <MessagesTab />}',
			button: `onClick={() => setActiveTab("messages")}`,
		},
	};

	// Resolve dependencies
	const resolvedModules = new Set();
	function resolveDependencies(moduleKey) {
		if (resolvedModules.has(moduleKey)) return;

		const module = MODULES[moduleKey];
		if (!module) return;

		// Add dependencies first
		if (module.dependencies) {
			module.dependencies.forEach((dep) => {
				if (modulesToInclude.has(dep) || MODULES[dep]?.required) {
					resolveDependencies(dep);
				}
			});
		}

		resolvedModules.add(moduleKey);
	}

	// Resolve all selected modules
	modulesToInclude.forEach((moduleKey) => {
		resolveDependencies(moduleKey);
	});

	// Build imports and components for resolved modules
	resolvedModules.forEach((moduleKey) => {
		const tab = tabMap[moduleKey];
		if (tab) {
			imports.push(tab.import);
			tabButtons.push({
				key: tab.tabKey,
				icon: tab.icon,
				label: tab.label,
				button: tab.button,
			});
			tabContent.push(tab.component);
		}
	});

	return {
		imports: [...new Set(imports)], // Remove duplicates
		tabButtons,
		tabContent,
	};
}
