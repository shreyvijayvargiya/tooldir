import React from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { Card, CardContent } from "@/components/ui/card";

const TermsPage = () => (
	<>
		<Head>
			<title>Terms & Conditions — ToolDir</title>
			<meta
				name="description"
				content="ToolDir terms and conditions for using our AI tool directory and submission services."
			/>
		</Head>

		<div className="min-h-screen flex flex-col">
			<Navbar />

			<section className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-3xl mx-auto">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Terms & Conditions
					</h1>
					<p className="text-sm text-muted-foreground mb-8">
						Last updated: March 1, 2026
					</p>

					<Card>
						<CardContent className="p-6 space-y-6 text-foreground">
							<section>
								<h2 className="text-lg font-semibold mb-2">
									1. Acceptance of Terms
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									By accessing or using ToolDir, you agree to be bound by these
									Terms & Conditions. If you do not agree, please do not use our
									services.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									2. Directory Listings
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed mb-2">
									When submitting a tool to ToolDir, you represent that:
								</p>
								<ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
									<li>You own or have rights to list the submitted tool</li>
									<li>All information provided is accurate and not misleading</li>
									<li>
										Your tool complies with applicable laws and does not promote
										harmful content
									</li>
									<li>
										You will maintain the ToolDir badge on your website while
										listed
									</li>
								</ul>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									3. Launch Slots & Payments
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									Paid launch slots are non-refundable once the slot date has
									passed. Free slots are subject to availability. ToolDir reserves
									the right to reschedule or cancel slots with reasonable notice.
									Payments are processed securely through Stripe.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									4. Content Moderation
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									We reserve the right to review, edit, reject, or remove any
									listing that violates our guidelines or misrepresents a product.
									We are not obligated to host any submitted tool.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									5. Intellectual Property
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									ToolDir and its branding, design, and content are owned by us.
									Tool listings remain the property of their respective owners. By
									submitting, you grant us a license to display your tool
									information on our platform.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">
									6. Limitation of Liability
								</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									ToolDir is provided &ldquo;as is.&rdquo; We make no warranties
									about the accuracy of listings or the performance of listed
									tools. We are not liable for any damages arising from your use
									of third-party tools discovered through our directory.
								</p>
							</section>

							<section>
								<h2 className="text-lg font-semibold mb-2">7. Contact</h2>
								<p className="text-muted-foreground text-sm leading-relaxed">
									For questions about these terms, contact{" "}
									<a
										href="mailto:legal@tooldir.com"
										className="text-primary hover:underline"
									>
										legal@tooldir.com
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

export default TermsPage;
