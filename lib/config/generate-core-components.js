import fs from "fs";
import path from "path";

/**
 * Generate Footer.jsx based on selected modules
 */
export function generateFooter(selectedModules = []) {
	const projectRoot = path.join(process.cwd());
	const footerPath = path.join(projectRoot, "app/components/Footer.jsx");
	
	let content = fs.readFileSync(footerPath, "utf-8");
	
	const hasSubscribers = selectedModules.includes("subscribers");
	
	if (!hasSubscribers) {
		// Remove subscribers import
		content = content.replace(/import\s*{\s*addSubscriber\s*}\s*from\s*["'][^"']*\/subscribers["'];?\n?/g, "");
		
		// Remove newsletter state variables
		content = content.replace(/const\s+\[newsletterEmail,\s*setNewsletterEmail\]\s*=\s*useState\(["'][^"']*["']\);\s*/g, "");
		content = content.replace(/const\s+\[newsletterName,\s*setNewsletterName\]\s*=\s*useState\(["'][^"']*["']\);\s*/g, "");
		content = content.replace(/const\s+\[isSubscribing,\s*setIsSubscribing\]\s*=\s*useState\(false\);\s*/g, "");
		
		// Remove handleNewsletterSubmit function
		const handleNewsletterStart = content.indexOf("const handleNewsletterSubmit");
		if (handleNewsletterStart !== -1) {
			// Find the closing brace of the function
			let braceCount = 0;
			let inFunction = false;
			let endIndex = handleNewsletterStart;
			
			for (let i = handleNewsletterStart; i < content.length; i++) {
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
			const beforeFunction = content.substring(0, handleNewsletterStart);
			const afterFunction = content.substring(endIndex + 1).replace(/^\s*;?\s*/, "");
			content = beforeFunction + afterFunction;
		}
		
		// Remove newsletter section from JSX
		const newsletterComment = content.indexOf("{/* Newsletter Section */}");
		const bottomComment = content.indexOf("{/* Bottom */}", newsletterComment);
		if (newsletterComment !== -1 && bottomComment !== -1) {
			const beforeNewsletter = content.substring(0, newsletterComment);
			const afterNewsletter = content.substring(bottomComment);
			content = beforeNewsletter + afterNewsletter;
		}
		
		// Remove Send icon from imports if not used
		if (!content.includes("<Send")) {
			content = content.replace(/,\s*Send/g, "");
			content = content.replace(/Send,\s*/g, "");
		}
	}
	
	return content;
}

/**
 * Generate blog.js based on selected modules
 */
export function generateBlogPage(selectedModules = []) {
	const projectRoot = path.join(process.cwd());
	const blogPath = path.join(projectRoot, "pages/blog.js");
	
	let content = fs.readFileSync(blogPath, "utf-8");
	
	const hasSubscribers = selectedModules.includes("subscribers");
	
	if (!hasSubscribers) {
		// Remove subscribers import
		content = content.replace(/import\s*{\s*addSubscriber\s*}\s*from\s*["'][^"']*\/subscribers["'];?\n?/g, "");
		
		// Remove subscriber-related state variables
		content = content.replace(/const\s+\[showSubscribeModal,\s*setShowSubscribeModal\]\s*=\s*useState\(false\);\s*/g, "");
		content = content.replace(/const\s+\[subscribeForm,\s*setSubscribeForm\]\s*=\s*useState\(\{[^}]*\}\);\s*/g, "");
		content = content.replace(/const\s+\[isSubmitting,\s*setIsSubmitting\]\s*=\s*useState\(false\);\s*/g, "");
	}
	
	return content;
}

/**
 * Generate SearchModal.jsx based on selected modules
 */
export function generateSearchModal(selectedModules = []) {
	const projectRoot = path.join(process.cwd());
	const searchModalPath = path.join(projectRoot, "app/admin/components/SearchModal.jsx");
	
	let content = fs.readFileSync(searchModalPath, "utf-8");
	
	const hasSubscribers = selectedModules.includes("subscribers");
	const hasBlog = selectedModules.includes("blog");
	const hasEmail = selectedModules.includes("email");
	
	// Remove unused imports
	if (!hasSubscribers) {
		content = content.replace(/import\s*{\s*getAllSubscribers\s*}\s*from\s*["'][^"']*\/subscribers["'];?\n?/g, "");
	}
	if (!hasBlog) {
		content = content.replace(/import\s*{\s*getAllBlogs\s*}\s*from\s*["'][^"']*\/blog["'];?\n?/g, "");
	}
	if (!hasEmail) {
		content = content.replace(/import\s*{\s*getAllEmails\s*}\s*from\s*["'][^"']*\/emails["'];?\n?/g, "");
	}
	
	// Remove unused queries
	if (!hasSubscribers) {
		const subscribersQueryStart = content.indexOf('const { data: subscribers = [] } = useQuery({');
		if (subscribersQueryStart !== -1) {
			const subscribersQueryEnd = content.indexOf('});', subscribersQueryStart) + 3;
			content = content.substring(0, subscribersQueryStart) + content.substring(subscribersQueryEnd + 1);
		}
	}
	if (!hasBlog) {
		const blogsQueryStart = content.indexOf('const { data: blogs = [] } = useQuery({');
		if (blogsQueryStart !== -1) {
			const blogsQueryEnd = content.indexOf('});', blogsQueryStart) + 3;
			content = content.substring(0, blogsQueryStart) + content.substring(blogsQueryEnd + 1);
		}
	}
	if (!hasEmail) {
		const emailsQueryStart = content.indexOf('const { data: emails = [] } = useQuery({');
		if (emailsQueryStart !== -1) {
			const emailsQueryEnd = content.indexOf('});', emailsQueryStart) + 3;
			content = content.substring(0, emailsQueryStart) + content.substring(emailsQueryEnd + 1);
		}
	}
	
	// Update searchData useMemo
	const searchDataStart = content.indexOf("const searchData = useMemo(() => {");
	const searchDataEnd = content.indexOf("}, [blogs, emails, subscribers, selectedCategory]);");
	
	if (searchDataStart !== -1 && searchDataEnd !== -1) {
		const beforeSearchData = content.substring(0, searchDataStart);
		const afterSearchData = content.substring(searchDataEnd + "}, [blogs, emails, subscribers, selectedCategory]);".length);
		
		let newSearchData = "const searchData = useMemo(() => {\n\t\tconst data = [];\n\n";
		
		if (hasBlog) {
			newSearchData += `\t\tif (selectedCategory === "all" || selectedCategory === "blogs") {
\t\t\tblogs.forEach((blog) => {
\t\t\t\tdata.push({
\t\t\t\t\ttype: "blog",
\t\t\t\t\tid: blog.id,
\t\t\t\t\ttitle: blog.title,
\t\t\t\t\tsubtitle: blog.slug || blog.author || "",
\t\t\t\t\tsearchText: \`\${blog.title} \${blog.slug || ""} \${blog.author || ""}\`,
\t\t\t\t\tdata: blog,
\t\t\t\t});
\t\t\t});
\t\t}\n\n`;
		}
		
		if (hasEmail) {
			newSearchData += `\t\tif (selectedCategory === "all" || selectedCategory === "emails") {
\t\t\temails.forEach((email) => {
\t\t\t\tdata.push({
\t\t\t\t\ttype: "email",
\t\t\t\t\tid: email.id,
\t\t\t\t\ttitle: email.subject,
\t\t\t\t\tsubtitle: email.status || "draft",
\t\t\t\t\tsearchText: \`\${email.subject} \${email.status || ""}\`,
\t\t\t\t\tdata: email,
\t\t\t\t});
\t\t\t});
\t\t}\n\n`;
		}
		
		if (hasSubscribers) {
			newSearchData += `\t\tif (selectedCategory === "all" || selectedCategory === "subscribers") {
\t\t\tsubscribers.forEach((subscriber) => {
\t\t\t\tdata.push({
\t\t\t\t\ttype: "subscriber",
\t\t\t\t\tid: subscriber.id,
\t\t\t\t\ttitle: subscriber.email,
\t\t\t\t\tsubtitle: subscriber.name || "",
\t\t\t\t\tsearchText: \`\${subscriber.email} \${subscriber.name || ""}\`,
\t\t\t\t\tdata: subscriber,
\t\t\t\t});
\t\t\t});
\t\t}\n\n`;
		}
		
		const dependencies = [];
		if (hasBlog) dependencies.push("blogs");
		if (hasEmail) dependencies.push("emails");
		if (hasSubscribers) dependencies.push("subscribers");
		dependencies.push("selectedCategory");
		
		newSearchData += `\t\treturn data;\n\t}, [${dependencies.join(", ")}]);`;
		
		content = beforeSearchData + newSearchData + afterSearchData;
	}
	
	// Update handleResultClick to only handle selected types
	const handleResultClickStart = content.indexOf("const handleResultClick = (result) => {");
	const handleResultClickEnd = content.indexOf("};", handleResultClickStart) + 2;
	
	if (handleResultClickStart !== -1 && handleResultClickEnd > handleResultClickStart) {
		let newHandleResultClick = "const handleResultClick = (result) => {\n\t\t";
		
		if (hasBlog) {
			newHandleResultClick += `if (result.type === "blog") {
\t\t\tonNavigate("blogs");
\t\t\twindow.location.href = \`/admin/editor/blog?id=\${result.id}\`;
\t\t} else `;
		}
		
		if (hasEmail) {
			newHandleResultClick += `if (result.type === "email") {
\t\t\tonNavigate("emails");
\t\t\twindow.location.href = \`/admin/editor/email?id=\${result.id}\`;
\t\t} else `;
		}
		
		if (hasSubscribers) {
			newHandleResultClick += `if (result.type === "subscriber") {
\t\t\tonNavigate("subscribers");
\t\t}`;
		} else {
			// Remove trailing " else " if no subscribers
			newHandleResultClick = newHandleResultClick.replace(/\s+else\s+$/, "");
		}
		
		newHandleResultClick += "\n\t\tonClose();\n\t};";
		
		const beforeHandleResult = content.substring(0, handleResultClickStart);
		const afterHandleResult = content.substring(handleResultClickEnd);
		content = beforeHandleResult + newHandleResultClick + afterHandleResult;
	}
	
	// Update guidanceActions to only include selected modules
	const guidanceActionsStart = content.indexOf("const guidanceActions = [");
	const guidanceActionsEnd = content.indexOf("];", guidanceActionsStart) + 2;
	
	if (guidanceActionsStart !== -1 && guidanceActionsEnd > guidanceActionsStart) {
		const actions = [];
		
		if (hasBlog) {
			actions.push(`\t\t{
\t\t\ticon: FileText,
\t\t\tlabel: "Create New Blog",
\t\t\taction: () => {
\t\t\t\tonNavigate("blogs");
\t\t\t\twindow.location.href = "/admin/editor/blog";
\t\t\t\tonClose();
\t\t\t},
\t\t}`);
		}
		
		if (hasEmail) {
			actions.push(`\t\t{
\t\t\ticon: Mail,
\t\t\tlabel: "Create New Email",
\t\t\taction: () => {
\t\t\t\tonNavigate("emails");
\t\t\t\twindow.location.href = "/admin/editor/email";
\t\t\t\tonClose();
\t\t\t},
\t\t}`);
		}
		
		if (hasSubscribers) {
			actions.push(`\t\t{
\t\t\ticon: Users,
\t\t\tlabel: "Check Subscribers",
\t\t\taction: () => {
\t\t\t\tonNavigate("subscribers");
\t\t\t\tonClose();
\t\t\t},
\t\t}`, `\t\t{
\t\t\ticon: Mail,
\t\t\tlabel: "Send Email to Subscriber",
\t\t\taction: () => {
\t\t\t\tonNavigate("subscribers");
\t\t\t\tonClose();
\t\t\t},
\t\t}`);
		}
		
		const newGuidanceActions = `const guidanceActions = [\n${actions.join(",\n")}\n\t];`;
		
		const beforeGuidance = content.substring(0, guidanceActionsStart);
		const afterGuidance = content.substring(guidanceActionsEnd);
		content = beforeGuidance + newGuidanceActions + afterGuidance;
	}
	
	// Update getTypeIcon and getTypeColor to only handle selected types
	const getTypeIconStart = content.indexOf("const getTypeIcon = (type) => {");
	const getTypeIconEnd = content.indexOf("};", getTypeIconStart) + 2;
	
	if (getTypeIconStart !== -1 && getTypeIconEnd > getTypeIconStart) {
		let newGetTypeIcon = "const getTypeIcon = (type) => {\n\t\tswitch (type) {\n";
		
		if (hasBlog) newGetTypeIcon += '\t\t\tcase "blog":\n\t\t\t\treturn FileText;\n';
		if (hasEmail) newGetTypeIcon += '\t\t\tcase "email":\n\t\t\t\treturn Mail;\n';
		if (hasSubscribers) newGetTypeIcon += '\t\t\tcase "subscriber":\n\t\t\t\treturn Users;\n';
		
		newGetTypeIcon += "\t\t\tdefault:\n\t\t\t\treturn FileText;\n\t\t}\n\t};";
		
		const beforeGetTypeIcon = content.substring(0, getTypeIconStart);
		const afterGetTypeIcon = content.substring(getTypeIconEnd);
		content = beforeGetTypeIcon + newGetTypeIcon + afterGetTypeIcon;
	}
	
	const getTypeColorStart = content.indexOf("const getTypeColor = (type) => {");
	const getTypeColorEnd = content.indexOf("};", getTypeColorStart) + 2;
	
	if (getTypeColorStart !== -1 && getTypeColorEnd > getTypeColorStart) {
		let newGetTypeColor = "const getTypeColor = (type) => {\n\t\tswitch (type) {\n";
		
		if (hasBlog) newGetTypeColor += '\t\t\tcase "blog":\n\t\t\t\treturn "bg-zinc-100 text-zinc-800";\n';
		if (hasEmail) newGetTypeColor += '\t\t\tcase "email":\n\t\t\t\treturn "bg-purple-100 text-purple-800";\n';
		if (hasSubscribers) newGetTypeColor += '\t\t\tcase "subscriber":\n\t\t\t\treturn "bg-green-100 text-green-800";\n';
		
		newGetTypeColor += '\t\t\tdefault:\n\t\t\t\treturn "bg-zinc-100 text-zinc-800";\n\t\t}\n\t};';
		
		const beforeGetTypeColor = content.substring(0, getTypeColorStart);
		const afterGetTypeColor = content.substring(getTypeColorEnd);
		content = beforeGetTypeColor + newGetTypeColor + afterGetTypeColor;
	}
	
	// Update placeholder text
	if (!hasBlog && !hasEmail && !hasSubscribers) {
		content = content.replace(/placeholder="Search blogs, emails, subscribers\.\.\."/g, 'placeholder="Search..."');
	} else {
		const searchTypes = [];
		if (hasBlog) searchTypes.push("blogs");
		if (hasEmail) searchTypes.push("emails");
		if (hasSubscribers) searchTypes.push("subscribers");
		content = content.replace(/placeholder="Search blogs, emails, subscribers\.\.\."/g, `placeholder="Search ${searchTypes.join(", ")}..."`);
	}
	
	return content;
}
