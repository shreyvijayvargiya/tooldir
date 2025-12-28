/**
 * Database Seeding API Route
 * POST /api/seed-database
 * 
 * Populates Firestore with sample blogs and emails
 * 
 * Usage: Make a POST request to /api/seed-database
 */

import { createBlog } from "../../lib/api/blog";
import { createEmail } from "../../lib/api/emails";

// Sample blog data with Unsplash banners
const sampleBlogs = [
	{
		title: "Getting Started with Modern Web Development",
		slug: "getting-started-modern-web-development",
		content: `
			<h2>Introduction</h2>
			<p>Modern web development has evolved significantly over the past decade. With the rise of frameworks like React, Vue, and Next.js, building web applications has become more efficient and enjoyable.</p>
			
			<h2>Key Technologies</h2>
			<p>Today's web developers need to be familiar with:</p>
			<ul>
				<li>JavaScript (ES6+)</li>
				<li>React or Vue.js</li>
				<li>Node.js and Express</li>
				<li>Database management (SQL and NoSQL)</li>
				<li>Version control with Git</li>
			</ul>
			
			<h2>Best Practices</h2>
			<p>When starting your web development journey, focus on:</p>
			<ol>
				<li>Understanding the fundamentals</li>
				<li>Building projects to practice</li>
				<li>Contributing to open source</li>
				<li>Staying updated with latest trends</li>
			</ol>
			
			<h2>Conclusion</h2>
			<p>Web development is a rewarding field that offers endless opportunities for growth and creativity. Start building today!</p>
		`,
		author: "Sarah Johnson",
		status: "published",
		bannerImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=600&fit=crop",
	},
	{
		title: "The Future of Artificial Intelligence",
		slug: "future-of-artificial-intelligence",
		content: `
			<h2>AI Revolution</h2>
			<p>Artificial Intelligence is transforming industries across the globe. From healthcare to finance, AI is making processes more efficient and opening new possibilities.</p>
			
			<h2>Current Applications</h2>
			<p>AI is already being used in:</p>
			<ul>
				<li>Natural language processing</li>
				<li>Computer vision</li>
				<li>Predictive analytics</li>
				<li>Autonomous vehicles</li>
			</ul>
			
			<h2>Future Prospects</h2>
			<p>The future of AI holds promise for:</p>
			<ul>
				<li>General artificial intelligence</li>
				<li>Enhanced human-AI collaboration</li>
				<li>Solving complex global challenges</li>
			</ul>
			
			<h2>Ethical Considerations</h2>
			<p>As AI advances, we must consider ethical implications and ensure responsible development and deployment.</p>
		`,
		author: "Dr. Michael Chen",
		status: "published",
		bannerImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop",
	},
	{
		title: "Sustainable Living: A Complete Guide",
		slug: "sustainable-living-complete-guide",
		content: `
			<h2>Why Sustainable Living Matters</h2>
			<p>Sustainable living is about making choices that reduce our environmental impact and promote a healthier planet for future generations.</p>
			
			<h2>Simple Steps to Start</h2>
			<p>You can begin your sustainable journey with these easy steps:</p>
			<ol>
				<li>Reduce energy consumption</li>
				<li>Minimize waste</li>
				<li>Choose sustainable products</li>
				<li>Support local businesses</li>
			</ol>
			
			<h2>Energy Efficiency</h2>
			<p>Switch to LED bulbs, unplug devices when not in use, and consider renewable energy sources for your home.</p>
			
			<h2>Waste Reduction</h2>
			<p>Practice the three R's: Reduce, Reuse, and Recycle. Compost organic waste and avoid single-use plastics.</p>
			
			<h2>Making a Difference</h2>
			<p>Every small action counts. Together, we can create a more sustainable future.</p>
		`,
		author: "Emma Williams",
		status: "published",
		bannerImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=600&fit=crop",
	},
	{
		title: "Mastering TypeScript: From Basics to Advanced",
		slug: "mastering-typescript-basics-to-advanced",
		content: `
			<h2>What is TypeScript?</h2>
			<p>TypeScript is a superset of JavaScript that adds static type definitions. It helps catch errors early and makes code more maintainable.</p>
			
			<h2>Getting Started</h2>
			<p>To start using TypeScript:</p>
			<pre><code>npm install -g typescript
tsc --init</code></pre>
			
			<h2>Key Features</h2>
			<ul>
				<li>Static typing</li>
				<li>Interface definitions</li>
				<li>Generics</li>
				<li>Decorators</li>
			</ul>
			
			<h2>Best Practices</h2>
			<p>When working with TypeScript:</p>
			<ol>
				<li>Define clear interfaces</li>
				<li>Use strict mode</li>
				<li>Leverage type inference</li>
				<li>Write type-safe code</li>
			</ol>
			
			<h2>Advanced Concepts</h2>
			<p>Explore advanced features like conditional types, mapped types, and utility types to write more powerful TypeScript code.</p>
		`,
		author: "Alex Rodriguez",
		status: "draft",
		bannerImage: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=600&fit=crop",
	},
	{
		title: "Building Your First Mobile App",
		slug: "building-first-mobile-app",
		content: `
			<h2>Mobile App Development Journey</h2>
			<p>Building a mobile app can seem daunting, but with the right approach, anyone can create their first app.</p>
			
			<h2>Choose Your Platform</h2>
			<p>Decide between:</p>
			<ul>
				<li>Native development (iOS/Android)</li>
				<li>Cross-platform (React Native, Flutter)</li>
				<li>Hybrid (Ionic, Cordova)</li>
			</ul>
			
			<h2>Planning Your App</h2>
			<p>Before coding, plan your app's:</p>
			<ol>
				<li>Purpose and target audience</li>
				<li>Core features</li>
				<li>User interface design</li>
				<li>Technical requirements</li>
			</ol>
			
			<h2>Development Process</h2>
			<p>Start with a simple MVP, gather user feedback, and iterate. Use version control and test thoroughly.</p>
			
			<h2>Launch and Beyond</h2>
			<p>Prepare for launch by creating app store listings, marketing materials, and a support plan.</p>
		`,
		author: "Jessica Martinez",
		status: "published",
		bannerImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop",
	},
	{
		title: "The Art of Digital Photography",
		slug: "art-of-digital-photography",
		content: `
			<h2>Introduction to Digital Photography</h2>
			<p>Digital photography has made capturing moments more accessible than ever. Learn the fundamentals to take stunning photos.</p>
			
			<h2>Understanding Your Camera</h2>
			<p>Master the three pillars of photography:</p>
			<ul>
				<li><strong>Aperture:</strong> Controls depth of field</li>
				<li><strong>Shutter Speed:</strong> Freezes or blurs motion</li>
				<li><strong>ISO:</strong> Controls light sensitivity</li>
			</ul>
			
			<h2>Composition Techniques</h2>
			<p>Apply these rules for better composition:</p>
			<ol>
				<li>Rule of thirds</li>
				<li>Leading lines</li>
				<li>Symmetry and patterns</li>
				<li>Framing</li>
			</ol>
			
			<h2>Post-Processing</h2>
			<p>Learn basic editing techniques to enhance your photos while maintaining their natural beauty.</p>
			
			<h2>Practice Makes Perfect</h2>
			<p>The best way to improve is to practice regularly and study the work of other photographers.</p>
		`,
		author: "David Thompson",
		status: "published",
		bannerImage: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=600&fit=crop",
	},
];

// Sample email data - 6 emails for different categories
const sampleEmails = [
	{
		subject: "Welcome to Our Newsletter!",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #333;">Welcome to Our Newsletter!</h1>
				<p>Thank you for subscribing to our newsletter. We're excited to have you on board!</p>
				<p>You'll receive:</p>
				<ul>
					<li>Weekly updates on our latest content</li>
					<li>Exclusive tips and insights</li>
					<li>Special offers and promotions</li>
				</ul>
				<p>Stay tuned for our next email!</p>
				<p>Best regards,<br>The Team</p>
			</div>
		`,
		status: "published",
		category: "welcome",
		recipients: 1250,
	},
	{
		subject: "New Product Launch: Check Out Our Latest Features",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #333;">Exciting News: New Features Available!</h1>
				<p>We're thrilled to announce the launch of our latest features designed to make your experience even better.</p>
				<h2>What's New:</h2>
				<ul>
					<li>Enhanced dashboard with real-time analytics</li>
					<li>Improved collaboration tools</li>
					<li>Mobile app for iOS and Android</li>
				</ul>
				<p style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
					<strong>Special Offer:</strong> Get 20% off your first month when you upgrade today!
				</p>
				<p>Thank you for being part of our community!</p>
			</div>
		`,
		status: "published",
		category: "promotional",
		recipients: 3200,
	},
	{
		subject: "Weekly Newsletter: Top Stories This Week",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #333;">Your Weekly Digest</h1>
				<p>Here's what happened this week:</p>
				<h2>📰 Top Stories</h2>
				<div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 20px 0;">
					<h3>Story 1: Latest Tech Trends</h3>
					<p>Discover the emerging technologies shaping our future...</p>
				</div>
				<div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 20px 0;">
					<h3>Story 2: Industry Insights</h3>
					<p>Expert analysis on current market trends...</p>
				</div>
				<div style="border-left: 4px solid #007bff; padding-left: 15px; margin: 20px 0;">
					<h3>Story 3: Success Stories</h3>
					<p>Read about how our community is making an impact...</p>
				</div>
				<p>See you next week!</p>
			</div>
		`,
		status: "published",
		category: "newsletter",
		recipients: 4500,
	},
	{
		subject: "Order Confirmation - Thank You for Your Purchase",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #28a745;">Order Confirmed!</h1>
				<p>Thank you for your purchase. Your order has been confirmed and is being processed.</p>
				<div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
					<h3>Order Details:</h3>
					<p><strong>Order ID:</strong> #12345</p>
					<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
					<p><strong>Total:</strong> $99.99</p>
				</div>
				<p>You will receive a shipping confirmation email once your order has been shipped.</p>
				<p>If you have any questions, please don't hesitate to contact our support team.</p>
				<p>Thank you for choosing us!</p>
			</div>
		`,
		status: "published",
		category: "transactional",
		recipients: 890,
	},
	{
		subject: "Important Announcement: System Maintenance Scheduled",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #ffc107;">System Maintenance Notice</h1>
				<p>We wanted to inform you about an upcoming system maintenance that may affect service availability.</p>
				<div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
					<h3>Maintenance Details:</h3>
					<p><strong>Date:</strong> Saturday, March 15, 2024</p>
					<p><strong>Time:</strong> 2:00 AM - 6:00 AM EST</p>
					<p><strong>Duration:</strong> Approximately 4 hours</p>
				</div>
				<p>During this time, you may experience temporary service interruptions. We apologize for any inconvenience and appreciate your patience.</p>
				<p>If you have any questions, please contact our support team.</p>
			</div>
		`,
		status: "published",
		category: "announcement",
		recipients: 5600,
	},
	{
		subject: "Your Account Has Been Updated",
		content: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
				<h1 style="color: #333;">Account Update Confirmation</h1>
				<p>This email confirms that your account settings have been successfully updated.</p>
				<div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
					<h3>Updated Information:</h3>
					<ul>
						<li>Email preferences</li>
						<li>Notification settings</li>
						<li>Profile information</li>
					</ul>
				</div>
				<p>If you did not make these changes, please contact our support team immediately.</p>
				<p>For security reasons, we recommend reviewing your account settings regularly.</p>
				<p>Thank you for keeping your account secure!</p>
			</div>
		`,
		status: "draft",
		category: "update",
		recipients: 0,
	},
];

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const results = {
			blogs: [],
			emails: [],
			errors: [],
		};

		// Seed blogs
		console.log("🌱 Seeding blogs...");
		for (const blog of sampleBlogs) {
			try {
				const blogId = await createBlog(blog);
				results.blogs.push({
					id: blogId,
					title: blog.title,
					status: "created",
				});
				console.log(`✅ Created blog: ${blog.title} (ID: ${blogId})`);
			} catch (error) {
				const errorMsg = `Error creating blog "${blog.title}": ${error.message}`;
				results.errors.push(errorMsg);
				console.error(`❌ ${errorMsg}`);
			}
		}

		// Seed emails
		console.log("🌱 Seeding emails...");
		for (const email of sampleEmails) {
			try {
				const emailId = await createEmail(email);
				results.emails.push({
					id: emailId,
					subject: email.subject,
					category: email.category,
					status: "created",
				});
				console.log(
					`✅ Created email: ${email.subject} (ID: ${emailId}, Category: ${email.category})`
				);
			} catch (error) {
				const errorMsg = `Error creating email "${email.subject}": ${error.message}`;
				results.errors.push(errorMsg);
				console.error(`❌ ${errorMsg}`);
			}
		}

		console.log("✨ Database seeding completed!");

		return res.status(200).json({
			success: true,
			message: "Database seeded successfully",
			results: {
				blogsCreated: results.blogs.length,
				emailsCreated: results.emails.length,
				errors: results.errors.length,
				details: results,
			},
		});
	} catch (error) {
		console.error("❌ Error during seeding:", error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
}

