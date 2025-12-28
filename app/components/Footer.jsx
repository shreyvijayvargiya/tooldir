import React, { useState } from "react";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin, Send } from "lucide-react";
import { addSubscriber } from "../../lib/api/subscribers";
import { toast } from "react-toastify";

const Footer = () => {
	const currentYear = new Date().getFullYear();
	const [newsletterEmail, setNewsletterEmail] = useState("");
	const [newsletterName, setNewsletterName] = useState("");
	const [isSubscribing, setIsSubscribing] = useState(false);

	const handleNewsletterSubmit = async (e) => {
		e.preventDefault();
		if (!newsletterEmail) {
			toast.warning("Email is required");
			return;
		}

		setIsSubscribing(true);
		try {
			await addSubscriber({
				email: newsletterEmail,
				name: newsletterName || newsletterEmail.split("@")[0],
			});
			toast.success("Successfully subscribed to newsletter!");
			setNewsletterEmail("");
			setNewsletterName("");
		} catch (error) {
			console.error("Error subscribing:", error);
			toast.error(error.message || "Failed to subscribe. Please try again.");
		} finally {
			setIsSubscribing(false);
		}
	};

	const footerLinks = {
		Product: [
			{ href: "/features", label: "Features" },
			{ href: "/pricing", label: "Pricing" },
			{ href: "/blog", label: "Blog" },
		],
		Company: [
			{ href: "/about", label: "About" },
			{ href: "/contact", label: "Contact" },
			{ href: "/careers", label: "Careers" },
		],
		Legal: [
			{ href: "/privacy", label: "Privacy" },
			{ href: "/terms", label: "Terms" },
			{ href: "/cookies", label: "Cookies" },
		],
	};

	return (
		<footer className="bg-zinc-50 border-t border-zinc-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="col-span-1">
						<h3 className="text-lg font-bold text-zinc-900 mb-2">YourApp</h3>
						<p className="text-sm text-zinc-600 mb-4">
							Build amazing SaaS products faster with our starter template.
						</p>
						<div className="flex items-center gap-3">
							<a
								href="https://twitter.com"
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
							>
								<Twitter className="w-4 h-4" />
							</a>
							<a
								href="https://github.com"
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
							>
								<Github className="w-4 h-4" />
							</a>
							<a
								href="https://linkedin.com"
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
							>
								<Linkedin className="w-4 h-4" />
							</a>
							<a
								href="mailto:support@yourapp.com"
								className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
							>
								<Mail className="w-4 h-4" />
							</a>
						</div>
					</div>

					{/* Links */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h4 className="text-sm font-semibold text-zinc-900 mb-3">
								{category}
							</h4>
							<ul className="space-y-2">
								{links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				{/* Newsletter Section */}
				<div className="mt-8 pt-8 border-t border-zinc-200">
					<div className="max-w-md mx-auto">
						<h4 className="text-sm font-semibold text-zinc-900 mb-3 text-center">
							Subscribe to our Newsletter
						</h4>
						<form
							onSubmit={handleNewsletterSubmit}
							className="flex flex-col sm:flex-row gap-2"
						>
							<input
								type="text"
								placeholder="Your name (optional)"
								value={newsletterName}
								onChange={(e) => setNewsletterName(e.target.value)}
								className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
							/>
							<input
								type="email"
								placeholder="Your email"
								value={newsletterEmail}
								onChange={(e) => setNewsletterEmail(e.target.value)}
								required
								className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
							/>
							<button
								type="submit"
								disabled={isSubscribing}
								className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
							>
								<Send className="w-4 h-4" />
								{isSubscribing ? "Subscribing..." : "Subscribe"}
							</button>
						</form>
					</div>
				</div>

				{/* Bottom */}
				<div className="mt-8 pt-8 border-t border-zinc-200 flex flex-col md:flex-row items-center justify-between">
					<p className="text-sm text-zinc-600">
						© {currentYear} YourApp. All rights reserved.
					</p>
					<p className="text-sm text-zinc-600 mt-2 md:mt-0">
						Made with ❤️ for developers
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
