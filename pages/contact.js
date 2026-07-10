import React, { useState } from "react";
import Head from "next/head";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { Mail, MessageSquare, Send } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/messages/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Message sent successfully! We'll get back to you soon.");
				setFormData({ name: "", email: "", subject: "", message: "" });
			} else {
				throw new Error(data.error || "Failed to send message");
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error(error.message || "Failed to send message. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<>
			<Head>
				<title>Contact Us - YourApp</title>
				<meta
					name="description"
					content="Get in touch with us. We'd love to hear from you."
				/>
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="flex-1 py-20 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto">
						<div className="text-center mb-12">
							<h1 className="text-4xl font-bold text-foreground mb-4">
								Get in Touch
							</h1>
							<p className="text-lg text-muted-foreground">
								Have a question? We'd love to hear from you.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

							<Card>
								<CardContent className="p-6">
									<form onSubmit={handleSubmit} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Name</Label>
											<Input
												id="name"
												type="text"
												name="name"
												value={formData.name}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												name="email"
												value={formData.email}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="subject">Subject</Label>
											<Input
												id="subject"
												type="text"
												name="subject"
												value={formData.subject}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="message">Message</Label>
											<Textarea
												id="message"
												name="message"
												value={formData.message}
												onChange={handleChange}
												required
												rows={5}
											/>
										</div>
										<Button
											type="submit"
											disabled={isSubmitting}
											className="w-full"
										>
											<Send className="w-4 h-4" />
											{isSubmitting ? "Sending..." : "Send Message"}
										</Button>
									</form>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default ContactPage;
