import React from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../app/components/Navbar";
import Footer from "../app/components/Footer";
import { FileText, Shield, Scale } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const LegalPage = () => {
	const legalDocuments = [
		{
			icon: Shield,
			title: "Privacy Policy",
			description:
				"Learn how we collect, use, and protect your personal information.",
			href: "/privacy",
		},
		{
			icon: FileText,
			title: "Terms and Conditions",
			description:
				"Read our terms of service and understand your rights and obligations.",
			href: "/terms-and-conditions",
		},
		{
			icon: Scale,
			title: "Cookie Policy",
			description:
				"Understand how we use cookies and tracking technologies on our website.",
			href: "/cookies",
		},
	];

	return (
		<>
			<Head>
				<title>Legal - YourApp</title>
				<meta
					name="description"
					content="Access our legal documents including privacy policy, terms and conditions, and cookie policy."
				/>
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="flex-1 py-20 px-4 sm:px-6 lg:px-8 bg-muted">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-12">
							<h1 className="text-4xl font-bold text-foreground mb-4">
								Legal Information
							</h1>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Access our legal documents and policies. We are committed to
								transparency and protecting your rights.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							{legalDocuments.map((doc, index) => {
								const Icon = doc.icon;
								return (
									<Link key={index} href={doc.href} className="group">
										<Card className="h-full transition-colors hover:border-foreground/20">
											<CardContent className="p-6">
												<div className="flex items-start gap-4">
													<div className="p-3 bg-primary text-primary-foreground rounded-xl flex-shrink-0">
														<Icon className="w-5 h-5" />
													</div>
													<div className="flex-1">
														<h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/80 transition-colors">
															{doc.title}
														</h3>
														<p className="text-sm text-muted-foreground">
															{doc.description}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>

						<Card>
							<CardHeader>
								<CardTitle>Legal Compliance</CardTitle>
								<CardDescription>
									We are committed to maintaining the highest standards of legal
									compliance and protecting the rights of our users. Our legal
									documents are regularly reviewed and updated to ensure they
									reflect current best practices and applicable laws.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<h3 className="text-xl font-semibold text-foreground mb-3">
									Questions or Concerns?
								</h3>
								<p className="text-muted-foreground leading-relaxed mb-4">
									If you have any questions about our legal documents or need to
									contact us regarding legal matters, please reach out to our
									legal team:
								</p>
								<div className="bg-muted rounded-xl p-4 border">
									<p className="text-muted-foreground">
										<strong className="text-foreground">Email:</strong>{" "}
										legal@yourapp.com
										<br />
										<strong className="text-foreground">Address:</strong> [Your
										Company Address]
									</p>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default LegalPage;
