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
	ChevronDown,
	ChevronUp,
	Send,
	Mail,
	MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

const HomePage = () => {
	const [expandedFaq, setExpandedFaq] = useState(null);
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
				"Seamless payment processing with Polar. Subscription management built-in.",
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
				"The template integrates with Polar for payment processing, supporting credit cards and other payment methods through their platform.",
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
							className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 mb-6"
						>
							Build Amazing SaaS Products{" "}
							<span className="text-zinc-600">Faster</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto"
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
							<Link
								href="/pricing"
								className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
							>
								Get Started
								<ArrowRight className="w-4 h-4" />
							</Link>
							<Link
								href="/docs"
								className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-200 text-zinc-900 rounded-xl font-medium hover:bg-zinc-50 transition-colors"
							>
								Learn More
							</Link>
						</motion.div>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
					<div className="max-w-6xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-zinc-900 mb-4">
								Everything You Need
							</h2>
							<p className="text-zinc-600 max-w-2xl mx-auto">
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
										className="p-6 bg-white border border-zinc-200 rounded-xl hover:border-zinc-300 transition-colors"
									>
										<div className="p-3 bg-zinc-900 text-white rounded-xl w-fit mb-4">
											<Icon className="w-5 h-5" />
										</div>
										<h3 className="text-lg font-semibold text-zinc-900 mb-2">
											{feature.title}
										</h3>
										<p className="text-sm text-zinc-600">
											{feature.description}
										</p>
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
							<h2 className="text-3xl font-bold text-zinc-900 mb-4">
								Simple, Transparent Pricing
							</h2>
							<p className="text-zinc-600 max-w-2xl mx-auto">
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
									className={`relative p-8 bg-white border-2 rounded-xl ${
										plan.popular
											? "border-zinc-900 shadow-lg"
											: "border-zinc-200"
									}`}
								>
									{plan.popular && (
										<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
											<span className="px-4 py-1 bg-zinc-900 text-white text-xs font-semibold rounded-full">
												Most Popular
											</span>
										</div>
									)}
									<div className="text-center mb-6">
										<h3 className="text-2xl font-bold text-zinc-900 mb-2">
											{plan.name}
										</h3>
										<div className="mb-2">
											<span className="text-4xl font-bold text-zinc-900">
												{plan.price}
											</span>
											<span className="text-zinc-600">/{plan.period}</span>
										</div>
										<p className="text-sm text-zinc-600">{plan.description}</p>
									</div>
									<ul className="space-y-3 mb-6">
										{plan.features.map((feature, idx) => (
											<li key={idx} className="flex items-start gap-2">
												<Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
												<span className="text-sm text-zinc-700">{feature}</span>
											</li>
										))}
									</ul>
									<Link
										href="/pricing"
										className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
											plan.popular
												? "bg-zinc-900 text-white hover:bg-zinc-800"
												: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
										}`}
									>
										Get Started
										<ArrowRight className="w-4 h-4" />
									</Link>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* FAQ Section */}
				<section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
					<div className="max-w-3xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-zinc-900 mb-4">
								Frequently Asked Questions
							</h2>
							<p className="text-zinc-600">
								Everything you need to know about our SaaS starter template.
							</p>
						</div>

						<div className="space-y-4">
							{faqs.map((faq, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
									className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
								>
									<button
										onClick={() =>
											setExpandedFaq(expandedFaq === index ? null : index)
										}
										className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
									>
										<span className="font-semibold text-zinc-900">
											{faq.question}
										</span>
										{expandedFaq === index ? (
											<ChevronUp className="w-5 h-5 text-zinc-600 flex-shrink-0" />
										) : (
											<ChevronDown className="w-5 h-5 text-zinc-600 flex-shrink-0" />
										)}
									</button>
									{expandedFaq === index && (
										<div className="px-4 pb-4 text-sm text-zinc-600">
											{faq.answer}
										</div>
									)}
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Contact Section */}
				<section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-12">
							<h2 className="text-3xl font-bold text-zinc-900 mb-4">
								Get in Touch
							</h2>
							<p className="text-zinc-600">
								Have a question? We'd love to hear from you.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Contact Info */}
							<div className="space-y-6">
								<div className="p-6 bg-white border border-zinc-200 rounded-xl">
									<div className="flex items-start gap-4">
										<div className="p-3 bg-zinc-900 text-white rounded-xl">
											<Mail className="w-5 h-5" />
										</div>
										<div>
											<h3 className="font-semibold text-zinc-900 mb-1">
												Email
											</h3>
											<p className="text-sm text-zinc-600">
												support@yourapp.com
											</p>
										</div>
									</div>
								</div>
								<div className="p-6 bg-white border border-zinc-200 rounded-xl">
									<div className="flex items-start gap-4">
										<div className="p-3 bg-zinc-900 text-white rounded-xl">
											<MessageSquare className="w-5 h-5" />
										</div>
										<div>
											<h3 className="font-semibold text-zinc-900 mb-1">
												Response Time
											</h3>
											<p className="text-sm text-zinc-600">
												We typically respond within 24 hours
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Contact Form */}
							<form
								onSubmit={handleContactSubmit}
								className="p-6 bg-white border border-zinc-200 rounded-xl space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-zinc-900 mb-1">
										Name
									</label>
									<input
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
										className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-900 mb-1">
										Email
									</label>
									<input
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
										className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-900 mb-1">
										Subject
									</label>
									<input
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
										className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-900 mb-1">
										Message
									</label>
									<textarea
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
										className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 text-sm"
									/>
								</div>
								<button
									type="submit"
									disabled={isSubmittingContact}
									className="w-full py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
								>
									<Send className="w-4 h-4" />
									{isSubmittingContact ? "Sending..." : "Send Message"}
								</button>
							</form>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50">
					<div className="max-w-4xl mx-auto text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="p-8 bg-zinc-900 rounded-xl text-white"
						>
							<h2 className="text-3xl font-bold mb-4">
								Ready to Get Started?
							</h2>
							<p className="text-zinc-300 mb-6">
								Join thousands of developers building amazing SaaS products.
							</p>
							<Link
								href="/pricing"
								className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-xl font-medium hover:bg-zinc-100 transition-colors"
							>
								View Pricing
								<ArrowRight className="w-4 h-4" />
							</Link>
						</motion.div>
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default HomePage;
