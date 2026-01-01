import fs from "fs";
import path from "path";
import { getAdminTabConfig } from "./modules-config";

/**
 * Generate admin/index.jsx file based on selected modules
 */
export function generateAdminIndex(selectedModules = []) {
	const projectRoot = path.join(process.cwd());
	const adminIndexPath = path.join(projectRoot, "app/admin/index.jsx");
	
	// Read the original file
	let content = fs.readFileSync(adminIndexPath, "utf-8");
	
	// Get tab configuration for selected modules
	const tabConfig = getAdminTabConfig(selectedModules);
	
	// Icon mapping
	const iconMap = {
		Home: "Home",
		FileText: "FileText",
		Mail: "Mail",
		User: "User",
		Users: "Users",
		CreditCard: "CreditCard",
		MessageSquare: "MessageSquare",
	};
	
	// Build icon imports (only for selected tabs + always needed icons)
	const iconImports = new Set();
	tabConfig.tabButtons.forEach((tab) => {
		const iconName = iconMap[tab.icon] || tab.icon;
		iconImports.add(iconName);
	});
	// Always include these icons
	iconImports.add("Menu");
	iconImports.add("X");
	iconImports.add("Search");
	iconImports.add("LogIn");
	iconImports.add("ChevronDown");
	iconImports.add("Plus");
	iconImports.add("ExternalLink");
	iconImports.add("RocketIcon");
	
	const iconImportsString = Array.from(iconImports).sort().join(",\n\t");
	
	// Replace icon imports
	const iconImportMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*["']lucide-react["'];?/);
	if (iconImportMatch) {
		content = content.replace(
			/import\s*\{[^}]*\}\s*from\s*["']lucide-react["'];?/,
			`import {\n\t${iconImportsString},\n} from "lucide-react";`
		);
	}
	
	// Replace tab component imports (only the tab imports, preserve other imports)
	const tabImportsStart = content.indexOf("import HomeTab from");
	if (tabImportsStart !== -1) {
		// Find the end of tab imports (before SearchModal or markEmailAsSent)
		let tabImportsEnd = content.indexOf("import SearchModal from", tabImportsStart);
		if (tabImportsEnd === -1) {
			tabImportsEnd = content.indexOf("import { markEmailAsSent }", tabImportsStart);
		}
		if (tabImportsEnd === -1) {
			// Fallback: find MessagesTab import end
			tabImportsEnd = content.indexOf("import MessagesTab from") + "import MessagesTab from './components/MessagesTab';".length;
		}
		
		if (tabImportsEnd > tabImportsStart) {
			const beforeImports = content.substring(0, tabImportsStart);
			const afterImports = content.substring(tabImportsEnd);
			content = beforeImports + tabConfig.imports.join("\n") + "\n" + afterImports;
		}
	}
	
	// Generate desktop sidebar buttons (between Search button and closing div)
	const desktopButtons = tabConfig.tabButtons.map((tab) => {
		const IconComponent = iconMap[tab.icon] || tab.icon;
		return `\t\t\t\t\t\t\t\t<button
\t\t\t\t\t\t\t\t\tonClick={() => setActiveTab("${tab.tabKey}")}
\t\t\t\t\t\t\t\t\tclassName={\`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 \${
\t\t\t\t\t\t\t\t\t\tactiveTab === "${tab.tabKey}"
\t\t\t\t\t\t\t\t\t\t\t? "bg-zinc-100 text-zinc-900"
\t\t\t\t\t\t\t\t\t\t\t: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
\t\t\t\t\t\t\t\t\t}\`}
\t\t\t\t\t\t\t\t>
\t\t\t\t\t\t\t\t\t<${IconComponent} className="w-3.5 h-3.5" />
\t\t\t\t\t\t\t\t\t${tab.label}
\t\t\t\t\t\t\t\t</button>`;
	}).join("\n");
	
	// Replace desktop sidebar buttons
	const desktopSearchEnd = content.indexOf('</button>', content.indexOf('Search'));
	const desktopDivStart = content.indexOf('<div className="">', desktopSearchEnd);
	if (desktopSearchEnd !== -1 && desktopDivStart !== -1) {
		const beforeButtons = content.substring(0, desktopSearchEnd + '</button>'.length);
		const afterButtons = content.substring(desktopDivStart);
		content = beforeButtons + "\n" + desktopButtons + "\n\t\t\t\t\t\t" + afterButtons;
	}
	
	// Generate mobile sidebar buttons
	const mobileButtons = tabConfig.tabButtons.map((tab) => {
		const IconComponent = iconMap[tab.icon] || tab.icon;
		return `\t\t\t\t\t\t\t<button
\t\t\t\t\t\t\t\tonClick={() => {
\t\t\t\t\t\t\t\t\tsetActiveTab("${tab.tabKey}");
\t\t\t\t\t\t\t\t\tsetIsSidebarOpen(false);
\t\t\t\t\t\t\t\t}}
\t\t\t\t\t\t\t\tclassName={\`w-full px-2.5 py-1.5 text-xs font-medium transition-colors rounded-xl flex items-center gap-2 \${
\t\t\t\t\t\t\t\t\tactiveTab === "${tab.tabKey}"
\t\t\t\t\t\t\t\t\t\t? "bg-zinc-100 text-zinc-900"
\t\t\t\t\t\t\t\t\t\t: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
\t\t\t\t\t\t\t\t}\`}
\t\t\t\t\t\t\t>
\t\t\t\t\t\t\t\t<${IconComponent} className="w-3.5 h-3.5" />
\t\t\t\t\t\t\t\t${tab.label}
\t\t\t\t\t\t\t</button>`;
	}).join("\n");
	
	// Replace mobile sidebar buttons (after mobile Search button)
	const mobileSearchEnd = content.lastIndexOf('</button>', content.lastIndexOf('Search'));
	const mobileDivStart = content.indexOf('<div className="p-3 space-y-1.5 mt-10">', mobileSearchEnd);
	if (mobileSearchEnd !== -1 && mobileDivStart !== -1) {
		const beforeMobileButtons = content.substring(0, mobileSearchEnd + '</button>'.length);
		const afterMobileButtons = content.substring(mobileDivStart);
		content = beforeMobileButtons + "\n" + mobileButtons + "\n\t\t\t\t\t\t" + afterMobileButtons;
	}
	
	// Replace tab content rendering
	const contentAreaStart = content.indexOf('{activeTab === "home" && <HomeTab />}');
	const contentAreaEnd = content.indexOf('{activeTab === "messages" && <MessagesTab />}') + '{activeTab === "messages" && <MessagesTab />}'.length;
	if (contentAreaStart !== -1 && contentAreaEnd !== -1) {
		const beforeContent = content.substring(0, contentAreaStart);
		const afterContent = content.substring(contentAreaEnd);
		const newTabContent = tabConfig.tabContent.join("\n\t\t\t\t\t\t\t\t");
		content = beforeContent + newTabContent + afterContent;
	}
	
	// Remove unused imports and functions
	const hasEmail = selectedModules.includes("email") || selectedModules.includes("subscribers");
	const hasUsers = selectedModules.includes("users");
	
	if (!hasEmail) {
		// Remove markEmailAsSent import
		content = content.replace(/import\s*{\s*markEmailAsSent\s*}\s*from\s*["'][^"']*\/emails["'];?\n?/g, "");
		// Remove handleSendEmail function
		const handleSendEmailStart = content.indexOf("// Send email to subscribers");
		if (handleSendEmailStart !== -1) {
			// Find the closing brace of the function
			let braceCount = 0;
			let inFunction = false;
			let endIndex = handleSendEmailStart;
			
			for (let i = handleSendEmailStart; i < content.length; i++) {
				if (content[i] === '{') {
					braceCount++;
					inFunction = true;
				} else if (content[i] === '}') {
					braceCount--;
					if (inFunction && braceCount === 0) {
						endIndex = i + 1;
						break;
					}
				}
			}
			
			// Remove the function and the semicolon after it
			const beforeFunction = content.substring(0, handleSendEmailStart);
			const afterFunction = content.substring(endIndex + 1).replace(/^\s*;?\s*/, "");
			content = beforeFunction + afterFunction;
		}
	}
	
	if (!hasUsers) {
		// Remove handleSendEmailToUsers function
		const handleSendEmailToUsersStart = content.indexOf("// Send email to authenticated users");
		if (handleSendEmailToUsersStart !== -1) {
			// Find the closing brace of the function
			let braceCount = 0;
			let inFunction = false;
			let endIndex = handleSendEmailToUsersStart;
			
			for (let i = handleSendEmailToUsersStart; i < content.length; i++) {
				if (content[i] === '{') {
					braceCount++;
					inFunction = true;
				} else if (content[i] === '}') {
					braceCount--;
					if (inFunction && braceCount === 0) {
						endIndex = i + 1;
						break;
					}
				}
			}
			
			// Remove the function and the semicolon after it
			const beforeFunction = content.substring(0, handleSendEmailToUsersStart);
			const afterFunction = content.substring(endIndex + 1).replace(/^\s*;?\s*/, "");
			content = beforeFunction + afterFunction;
		}
	}
	
	// Ensure core imports are always present (auth is always needed)
	// onAuthStateChange is used by admin panel for authentication
	const hasAuthImport = content.includes("import { onAuthStateChange }");
	if (!hasAuthImport) {
		// Add auth import if missing (shouldn't happen, but safety check)
		const importSection = content.indexOf("import { markEmailAsSent }");
		if (importSection === -1) {
			// Find where to add it (after SearchModal import)
			const searchModalImport = content.indexOf("import SearchModal from");
			if (searchModalImport !== -1) {
				const afterSearchModal = content.indexOf("\n", searchModalImport) + 1;
				content = content.substring(0, afterSearchModal) + 
					"import { onAuthStateChange } from \"../../lib/api/auth\";\n" + 
					content.substring(afterSearchModal);
			}
		}
	}
	
	return content;
}
