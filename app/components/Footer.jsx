import React, { useState } from "react";
import Link from "next/link";
import { Mail, Twitter, Github, Linkedin, Send } from "lucide-react";
import { addSubscriber } from "../../lib/api/subscribers";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
		<footer className="bg-muted border-t">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<div className="col-span-1">
						<h3 className="text-lg font-bold text-foreground mb-2">YourApp</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Build amazing SaaS products faster with our starter template.
						</p>
						<div className="flex items-center gap-3">
							{[
								{ href: "https://twitter.com", icon: Twitter },
								{ href: "https://github.com", icon: Github },
								{ href: "https://linkedin.com", icon: Linkedin },
							].map(({ href, icon: Icon }) => (
								<a
									key={href}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
								>
									<Button variant="ghost" size="icon">
										<Icon className="w-4 h-4" />
									</Button>
								</a>
							))}
							<a href="mailto:support@yourapp.com">
								<Button variant="ghost" size="icon">
									<Mail className="w-4 h-4" />
								</Button>
							</a>
						</div>
					</div>

					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h4 className="text-sm font-semibold text-foreground mb-3">
								{category}
							</h4>
							<ul className="space-y-2">
								{links.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="text-sm text-muted-foreground hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<Separator className="my-8" />

				<div className="max-w-md mx-auto">
					<h4 className="text-sm font-semibold text-foreground mb-3 text-center">
						Subscribe to our Newsletter
					</h4>
					<form
						onSubmit={handleNewsletterSubmit}
						className="flex flex-col sm:flex-row gap-2"
					>
						<Input
							type="text"
							placeholder="Your name (optional)"
							value={newsletterName}
							onChange={(e) => setNewsletterName(e.target.value)}
						/>
						<Input
							type="email"
							placeholder="Your email"
							value={newsletterEmail}
							onChange={(e) => setNewsletterEmail(e.target.value)}
							required
						/>
						<Button type="submit" disabled={isSubscribing}>
							<Send className="w-4 h-4" />
							{isSubscribing ? "Subscribing..." : "Subscribe"}
						</Button>
					</form>
				</div>

				<Separator className="my-8" />

				<div className="flex flex-col md:flex-row items-center justify-between">
					<p className="text-sm text-muted-foreground">
						© {currentYear} YourApp. All rights reserved.
					</p>
					<p className="text-sm text-muted-foreground mt-2 md:mt-0">
						Made with ❤️ for developers
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
