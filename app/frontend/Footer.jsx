import React from "react";
import Link from "next/link";
import { Mail, Twitter, Github } from "lucide-react";
import { usePreset } from "@/lib/presets/PresetContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
	const { preset } = usePreset();
	const entityLabel =
		preset.landing.navSubmitLabel ||
		`Submit ${preset.entitySingular[0].toUpperCase()}${preset.entitySingular.slice(1)}`;

	const footerLinks = {
		Product: [
			{ href: "/", label: "Directory" },
			{ href: "/pricing", label: "Pricing" },
			{ href: "/submit", label: entityLabel },
			{ href: "/blog", label: "Blog" },
		],
		Company: [
			{ href: "/contact", label: "Contact" },
			{ href: "/pricing", label: "Book Launch Slot" },
		],
		Legal: [
			{ href: "/privacy", label: "Privacy Policy" },
			{ href: "/terms-and-conditions", label: "Terms & Conditions" },
		],
	};

	const socialLinks = [
		{ href: "https://x.com", icon: Twitter, label: "X" },
		{ href: "https://github.com", icon: Github, label: "GitHub" },
	];

	return (
		<footer className="bg-transparent border-t">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-5 gap-8">
					<div className="col-span-2">
						<Link href="/" className="inline-block mb-2">
							<span className="text-lg font-semibold -rotate-3 text-foreground p-1 border border-dashed">
								{preset.brand}
							</span>
						</Link>
						<p className="text-sm text-muted-foreground mb-4 max-w-xs">
							{preset.landing.footerBlurb}
						</p>
						<div className="flex items-center gap-2">
							{socialLinks.map(({ href, icon: Icon, label }) => (
								<a
									key={label}
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={label}
								>
									<Button variant="ghost" size="icon">
										<Icon className="w-4 h-4" />
									</Button>
								</a>
							))}
							<a href="mailto:hello@tooldir.com" aria-label="Email">
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
									<li key={link.href + link.label}>
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

				<div className="flex flex-col md:flex-row items-center justify-between gap-2">
					<p className="text-sm text-muted-foreground" suppressHydrationWarning>
						© {new Date().getFullYear()} {preset.brand}. All rights reserved.
					</p>
					<div className="flex gap-4">
						<Link
							href="/privacy"
							className="text-xs text-muted-foreground hover:text-foreground"
						>
							Privacy
						</Link>
						<Link
							href="/terms-and-conditions"
							className="text-xs text-muted-foreground hover:text-foreground"
						>
							Terms
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
