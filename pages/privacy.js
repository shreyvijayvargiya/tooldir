import React from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { Card, CardContent } from "@/components/ui/card";

const PrivacyPage = () => (
	<>
		<Head>
			<title>Privacy Policy — ToolDir</title>
			<meta
				name="description"
				content="ToolDir privacy policy. Learn how we collect, use, and protect your data."
			/>
		</Head>

		<div className="min-h-screen flex flex-col">
			<Navbar />

			<section className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Privacy Policy
					</h1>
					<p className="text-sm text-muted-foreground mb-8">
						Last updated: March 1, 2026
					</p>

					<Card>
						<CardContent className="p-6 prose prose-sm max-w-none space-y-6 text-foreground">
							<section>
								<h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									ToolDir (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
									operates the ToolDir website and AI tool directory. This Privacy
									Policy explains how we collect, use, disclose, and safeguard your
									information when you visit our website or submit a tool listing.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									2. Information We Collect
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed mb-2">
									We may collect the following types of information:
								</p>
								<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
									<li>
										Account information (name, email) when you register or submit
										a tool
									</li>
									<li>
										Tool submission data (name, website, description, logo,
										screenshots)
									</li>
									<li>
										Usage data and analytics (pages visited, search queries,
										referrer)
									</li>
									<li>
										Cookies and similar tracking technologies (see Cookie Policy
										below)
									</li>
									<li>Payment information processed securely via Stripe</li>
								</ul>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									3. How We Use Your Information
								</h2>
								<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
									<li>To operate and maintain the ToolDir directory</li>
									<li>To process tool submissions and launch slot bookings</li>
									<li>To send transactional emails and launch confirmations</li>
									<li>To improve our website and user experience</li>
									<li>To comply with legal obligations</li>
								</ul>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">4. Cookies</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									We use cookies to remember your preferences, analyze traffic, and
									personalize content. You can accept or decline cookies via our
									cookie consent banner. Essential cookies are required for the site
									to function properly.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">5. Data Sharing</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									We do not sell your personal data. We may share information with
									trusted service providers (Supabase, Stripe, PostHog, Resend) who
									assist in operating our platform, subject to confidentiality
									agreements.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">6. Your Rights</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Depending on your location, you may have the right to access,
									correct, delete, or export your personal data. Contact us at{" "}
									<a
										href="mailto:privacy@tooldir.com"
										className="text-primary hover:underline"
									>
										privacy@tooldir.com
									</a>{" "}
									to exercise these rights.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">7. Contact</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Questions about this policy? Email us at{" "}
									<a
										href="mailto:hello@tooldir.com"
										className="text-primary hover:underline"
									>
										hello@tooldir.com
									</a>
									.
								</p>
							</section>
						</CardContent>
					</Card>
				</div>
			</section>

			<Footer />
		</div>
	</>
);

export default PrivacyPage;
