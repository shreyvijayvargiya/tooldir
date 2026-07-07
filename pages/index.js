import React, { useState } from "react";
import Head from "next/head";
import Navbar from "../app/components/Navbar";
import Footer from "../app/components/Footer";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Zap,
	Shield,
	Rocket,
	Sparkles,
	Database,
	CreditCard,
	Users,
	BarChart3,
	Send,
	Mail,
	MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

const HomePage = () => {
	const [contactForm, setContactForm] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmittingContact, setIsSubmittingContact] = useState(false);

	const features = [
		{
			icon: Zap,
			title: "Lightning Fast Performance",
			description:
				"Built with Next.js 15 and React 18 for optimal performance and SEO.",
		},
		{
			icon: Shield,
			title: "Secure Authentication",
			description:
				"Complete authentication system with email/password and Google OAuth.",
		},
		{
			icon: CreditCard,
			title: "Payment Integration",
			description:
				"Seamless payment processing with Stripe. Subscription management built-in.",
		},
		{
			icon: Database,
			title: "Database Ready",
			description:
				"Supabase database integration with PostgreSQL included.",
		},
		{
			icon: Users,
			title: "User Management",
			description:
				"Complete user management system with teams, roles, and permissions.",
		},
		{
			icon: BarChart3,
			title: "Analytics Dashboard",
			description:
				"Beautiful analytics dashboard with charts and metrics included.",
		},
		{
			icon: Rocket,
			title: "Scalable Architecture",
			description:
				"Built to scale from startup to enterprise with clean architecture.",
		},
		{
			icon: Sparkles,
			title: "Modern UI/UX",
			description:
				"Beautiful, responsive design with Tailwind CSS and Framer Motion.",
		},
	];

	const plans = [
		{
			id: "pro-monthly",
			name: "Pro",
			price: "$29",
			period: "month",
			description: "Perfect for individuals and small teams",
			features: [
				"All core features",
				"Priority support",
				"Advanced analytics",
				"Custom integrations",
				"API access",
			],
			popular: true,
		},
		{
			id: "pro-yearly",
			name: "Pro",
			price: "$290",
			period: "year",
			description: "Best value for long-term users",
			features: [
				"All Pro features",
				"2 months free",
				"Priority support",
				"Advanced analytics",
				"Custom integrations",
				"API access",
			],
			popular: false,
		},
	];

	const faqs = [
		{
			question: "What's included in the template?",
			answer:
				"The template includes a complete admin panel, customer-facing app, authentication, payment integration, blog system, email management, and analytics dashboard. Everything you need to launch your SaaS product.",
		},
		{
			question: "Do I need coding experience?",
			answer:
				"Basic knowledge of JavaScript and React is helpful, but the template is well-documented with clear instructions. You can customize it to match your brand with minimal coding.",
		},
		{
			question: "Can I use my own backend?",
			answer:
				"Yes! The template works with Supabase, or any backend API. You can easily swap out the database and API integrations to match your preferences.",
		},
		{
			question: "Is there support included?",
			answer:
				"The template includes comprehensive documentation and code comments. For additional support, check the template documentation or reach out through our contact form.",
		},
		{
			question: "How do I customize the design?",
			answer:
				"The entire design is built with Tailwind CSS, making it easy to customize colors, fonts, spacing, and layouts. All components are modular and well-organized.",
		},
		{
			question: "What payment methods are supported?",
			answer:
				"The template integrates with Stripe for payment processing, supporting credit cards and other payment methods through their platform.",
		},
	];

	const handleContactSubmit = async (e) => {
		e.preventDefault();
		setIsSubmittingContact(true);

		try {
			const response = await fetch("/api/messages/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(contactForm),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Message sent successfully! We'll get back to you soon.");
				setContactForm({ name: "", email: "", subject: "", message: "" });
			} else {
				throw new Error(data.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error(error.message || "Failed to send message. Please try again.");
		} finally {
			setIsSubmittingContact(false);
		}
	};

	return (
		<>
			<Head>
				<title>YourApp - Build Amazing SaaS Products Faster</title>
				<meta
					name="description"
					content="SaaS starter template to build amazing products faster. Includes authentication, payments, and more."
				/>
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />

				{/* Hero Section */}
				<section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto text-center">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
						>
							Build Amazing SaaS Products{" "}
							<span className="text-muted-foreground">Faster</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
						>
							Start building your SaaS product today with our complete starter
							template. Includes authentication, payments, admin panel, and
							more.
						</motion.p>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="flex flex-col sm:flex-row items-center justify-center gap-4"
						>
							<Button asChild size="lg">
								<Link href="/pricing">
									Get Started
									<ArrowRight className="w-4 h-4" />
								</Link>
							</Button>
							<Button asChild variant="outline" size="lg">
								<Link href="/docs">Learn More</Link>
							</Button>
						</motion.div>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-foreground mb-4">
								Everything You Need
							</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								All the essential features to launch your SaaS product quickly
								and efficiently.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{features.map((feature, index) => {
								const Icon = feature.icon;
								return (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
									>
										<Card className="h-full hover:shadow-md transition-shadow">
											<CardContent className="p-6">
												<div className="p-3 bg-primary text-primary-foreground rounded-xl w-fit mb-4">
													<Icon className="w-5 h-5" />
												</div>
												<h3 className="text-lg font-semibold text-foreground mb-2">
													{feature.title}
												</h3>
												<p className="text-sm text-muted-foreground">
													{feature.description}
												</p>
											</CardContent>
										</Card>
									</motion.div>
								);
							})}
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-foreground mb-4">
								Simple, Transparent Pricing
							</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								Choose the plan that works best for you. All plans include a
								14-day free trial.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
							{plans.map((plan, index) => (
								<motion.div
									key={plan.id}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
									className="relative"
								>
									<Card
										className={`h-full ${
											plan.popular
												? "border-primary border-2 shadow-lg"
												: ""
										}`}
									>
										{plan.popular && (
											<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
												<Badge>Most Popular</Badge>
											</div>
										)}
										<CardContent className="p-8">
											<div className="text-center mb-6">
												<h3 className="text-2xl font-bold text-foreground mb-2">
													{plan.name}
												</h3>
												<div className="mb-2">
													<span className="text-4xl font-bold text-foreground">
														{plan.price}
													</span>
													<span className="text-muted-foreground">/{plan.period}</span>
												</div>
												<p className="text-sm text-muted-foreground">{plan.description}</p>
											</div>
											<ul className="space-y-3 mb-6">
												{plan.features.map((feature, idx) => (
													<li key={idx} className="flex items-start gap-2">
														<Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
														<span className="text-sm text-foreground">{feature}</span>
													</li>
												))}
											</ul>
											<Button
												asChild
												variant={plan.popular ? "default" : "secondary"}
												className="w-full"
											>
												<Link href="/pricing">
													Get Started
													<ArrowRight className="w-4 h-4" />
												</Link>
											</Button>
										</CardContent>
									</Card>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
					<div className="max-w-3xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-foreground mb-4">
								Frequently Asked Questions
							</h2>
							<p className="text-muted-foreground">
								Everything you need to know about our SaaS starter template.
							</p>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<Card>
								<CardContent className="p-6">
									<Accordion type="single" collapsible className="w-full">
										{faqs.map((faq, index) => (
											<AccordionItem key={index} value={`item-${index}`}>
												<AccordionTrigger className="text-left">
													{faq.question}
												</AccordionTrigger>
												<AccordionContent className="text-muted-foreground">
													{faq.answer}
												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</section>

				{/* Contact Section */}
				<section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-foreground mb-4">
								Get in Touch
							</h2>
							<p className="text-muted-foreground">
								Have a question? We'd love to hear from you.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Contact Info */}
							<div className="space-y-6">
								<Card>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="p-3 bg-primary text-primary-foreground rounded-xl">
												<Mail className="w-5 h-5" />
											</div>
											<div>
												<h3 className="font-semibold text-foreground mb-1">
													Email
												</h3>
												<p className="text-sm text-muted-foreground">
													support@yourapp.com
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
								<Card>
									<CardContent className="p-6">
										<div className="flex items-start gap-4">
											<div className="p-3 bg-primary text-primary-foreground rounded-xl">
												<MessageSquare className="w-5 h-5" />
											</div>
											<div>
												<h3 className="font-semibold text-foreground mb-1">
													Response Time
												</h3>
												<p className="text-sm text-muted-foreground">
													We typically respond within 24 hours
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Contact Form */}
							<Card>
								<CardContent className="p-6">
									<form onSubmit={handleContactSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												type="text"
												name="name"
												value={contactForm.name}
												onChange={(e) =>
													setContactForm({
														...contactForm,
														[e.target.name]: e.target.value,
													})
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												name="email"
												value={contactForm.email}
												onChange={(e) =>
													setContactForm({
														...contactForm,
														[e.target.name]: e.target.value,
													})
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="subject">Subject</Label>
											<Input
												id="subject"
												type="text"
												name="subject"
												value={contactForm.subject}
												onChange={(e) =>
													setContactForm({
														...contactForm,
														[e.target.name]: e.target.value,
													})
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="message">Message</Label>
											<Textarea
												id="message"
												name="message"
												value={contactForm.message}
												onChange={(e) =>
													setContactForm({
														...contactForm,
														[e.target.name]: e.target.value,
													})
												}
												required
												rows={4}
											/>
										</div>
										<Button
											type="submit"
											disabled={isSubmittingContact}
											className="w-full"
										>
											<Send className="w-4 h-4" />
											{isSubmittingContact ? "Sending..." : "Send Message"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted">
					<div className="max-w-4xl mx-auto text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
						>
							<Card className="bg-primary text-primary-foreground border-primary">
								<CardContent className="p-8">
									<h2 className="text-3xl font-bold mb-4">
										Ready to Get Started?
									</h2>
									<p className="text-primary-foreground/80 mb-6">
										Join thousands of developers building amazing SaaS products.
									</p>
									<Button
										asChild
										variant="secondary"
										size="lg"
									>
										<Link href="/pricing">
											View Pricing
											<ArrowRight className="w-4 h-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</motion.div>
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default HomePage;
