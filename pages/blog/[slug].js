import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Navbar from "../../app/frontend/Navbar";
import Footer from "../../app/frontend/Footer";
import {
	Calendar,
	ArrowLeft,
	Copy,
	Check,
	Link as LinkIcon,
	Twitter,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBlogBySlug } from "@/lib/hooks/useBlogs";
import { formatDisplayDate } from "@/lib/utils/formatDate";
import { toBlogMarkdown } from "@/lib/utils/blogContent";
import { getBlogSeo, getSiteOrigin } from "@/lib/utils/blogSeo";

const CodeBlock = ({ language, children, ...props }) => {
	const [copied, setCopied] = useState(false);
	const codeString = String(children).replace(/\n$/, "");

	const handleCopyCode = async () => {
		try {
			await navigator.clipboard.writeText(codeString);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
			toast.success("Code copied to clipboard!");
		} catch (error) {
			console.error("Failed to copy code:", error);
			toast.error("Failed to copy code");
		}
	};

	return (
		<div className="relative group mb-4">
			<div className="absolute top-2 right-2 z-10">
				<Button
					size="sm"
					variant={copied ? "secondary" : "outline"}
					onClick={handleCopyCode}
					className="h-7 gap-1.5 text-xs"
				>
					{copied ? (
						<>
							<Check className="w-3 h-3" />
							Copied
						</>
					) : (
						<>
							<Copy className="w-3 h-3" />
							Copy
						</>
					)}
				</Button>
			</div>
			<SyntaxHighlighter
				language={language || "javascript"}
				style={oneLight}
				PreTag="div"
				className="rounded border border-border !bg-background"
				customStyle={{
					background: "hsl(var(--background))",
					padding: "1rem",
					margin: 0,
					fontSize: "0.875rem",
					border: "1px solid hsl(var(--border))",
				}}
				{...props}
			>
				{codeString}
			</SyntaxHighlighter>
		</div>
	);
};

const markdownComponents = {
	h1: ({ node, ...props }) => (
		<h1 className="text-3xl font-bold text-foreground mb-4 mt-8" {...props} />
	),
	h2: ({ node, ...props }) => (
		<h2 className="text-2xl font-bold text-foreground mb-3 mt-6" {...props} />
	),
	h3: ({ node, ...props }) => (
		<h3 className="text-xl font-semibold text-foreground mb-2 mt-4" {...props} />
	),
	h4: ({ node, ...props }) => (
		<h4 className="text-lg font-semibold text-foreground mb-2 mt-3" {...props} />
	),
	p: ({ node, ...props }) => (
		<p className="text-muted-foreground mb-4 leading-7 text-base" {...props} />
	),
	ul: ({ node, ...props }) => (
		<ul
			className="list-disc mb-4 space-y-2 text-muted-foreground text-base ml-6 pl-2"
			style={{ listStylePosition: "outside" }}
			{...props}
		/>
	),
	ol: ({ node, ...props }) => (
		<ol
			className="list-decimal mb-4 space-y-2 text-muted-foreground text-base ml-6 pl-2"
			style={{ listStylePosition: "outside" }}
			{...props}
		/>
	),
	li: ({ node, ...props }) => <li className="mb-1.5 leading-7" {...props} />,
	code: ({ node, inline, className, children, ...props }) => {
		if (inline) {
			return (
				<code
					className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
					{...props}
				>
					{children}
				</code>
			);
		}

		const match = /language-(\w+)/.exec(className || "");
		const language = match ? match[1] : "";
		const codeString = String(children).replace(/\n$/, "");

		if (language || codeString.match(/[{}();=<>[\]]/)) {
			return (
				<CodeBlock language={language} {...props}>
					{codeString}
				</CodeBlock>
			);
		}

		return (
			<div className="text-muted-foreground mb-4 leading-7 text-base">
				{codeString}
			</div>
		);
	},
	pre: ({ children }) => <>{children}</>,
	blockquote: ({ node, ...props }) => (
		<blockquote
			className="border-l-4 border-border pl-4 italic text-muted-foreground my-6 text-base"
			{...props}
		/>
	),
	a: ({ node, ...props }) => (
		<a
			className="text-primary hover:underline"
			target="_blank"
			rel="noopener noreferrer"
			{...props}
		/>
	),
	strong: ({ node, ...props }) => (
		<strong className="font-semibold text-foreground" {...props} />
	),
	em: ({ node, ...props }) => <em className="italic text-foreground/80" {...props} />,
	img: ({ node, ...props }) => (
		<img className="rounded-xl shadow-lg my-6 w-full h-auto" alt="" {...props} />
	),
	hr: ({ node, ...props }) => <hr className="border-border my-8" {...props} />,
};

const BlogPostPage = () => {
	const router = useRouter();
	const { slug } = router.query;

	const { data: blog, isLoading, isError } = useBlogBySlug(slug);

	const markdownContent = useMemo(
		() => toBlogMarkdown(blog?.content),
		[blog?.content]
	);

	const seo = useMemo(() => getBlogSeo(blog), [blog]);
	const shareUrl = seo?.canonicalUrl || `${getSiteOrigin()}/blog/${slug || ""}`;

	const formatDate = (date) => {
		if (!date) return "N/A";
		const value = date?.toDate ? date.toDate().toISOString() : date;
		return formatDisplayDate(value);
	};

	if (!router.isReady || isLoading) {
		return (
			<>
				<Head>
					<title>Loading... | ToolDir Blog</title>
				</Head>
				<div className="min-h-screen flex flex-col">
					<Navbar />
					<div className="flex-1 flex items-center justify-center">
						<div className="text-muted-foreground">Loading...</div>
					</div>
					<Footer />
				</div>
			</>
		);
	}

	if (isError || !blog) {
		return (
			<>
				<Head>
					<title>Blog Post Not Found | ToolDir</title>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className="min-h-screen flex flex-col">
					<Navbar />
					<div className="flex-1 flex items-center justify-center px-4">
						<Card className="max-w-md w-full">
							<CardContent className="p-8 text-center">
								<h1 className="text-2xl font-bold text-foreground mb-4">
									Blog Post Not Found
								</h1>
								<p className="text-muted-foreground mb-6 text-sm">
									This post may have been removed or the URL is incorrect.
								</p>
								<Button variant="link" asChild>
									<Link href="/blog">Back to Blog</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
					<Footer />
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>{seo.title}</title>
				<meta name="description" content={seo.description} />
				<link rel="canonical" href={seo.canonicalUrl} />
				<meta property="og:type" content={seo.ogType} />
				<meta property="og:title" content={blog.title} />
				<meta property="og:description" content={seo.description} />
				<meta property="og:url" content={seo.canonicalUrl} />
				<meta property="og:image" content={seo.ogImage} />
				<meta name="twitter:card" content={seo.twitterCard} />
				<meta name="twitter:title" content={blog.title} />
				<meta name="twitter:description" content={seo.description} />
				<meta name="twitter:image" content={seo.ogImage} />
				{seo.publishedTime && (
					<meta property="article:published_time" content={seo.publishedTime} />
				)}
				<meta property="article:author" content={seo.author} />
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />

				<article className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-3xl mx-auto">
						<Button variant="ghost" size="sm" asChild className="mb-6">
							<Link href="/blog">
								<ArrowLeft className="w-4 h-4" />
								Back to Blog
							</Link>
						</Button>

						{blog.bannerImage && (
							<img
								src={blog.bannerImage}
								alt={blog.title}
								className="w-full h-64 sm:h-96 object-cover rounded-xl mb-6"
							/>
						)}

						<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar className="w-4 h-4" />
								{formatDate(blog.publishedAt || blog.createdAt)}
								{blog.author && (
									<>
										<span>•</span>
										<Badge variant="secondary">{blog.author}</Badge>
									</>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={async () => {
										try {
											await navigator.clipboard.writeText(markdownContent);
											toast.success("Markdown copied to clipboard!");
										} catch {
											toast.error("Failed to copy markdown");
										}
									}}
									title="Copy Markdown"
								>
									<Copy className="w-3.5 h-3.5" />
									Copy Markdown
								</Button>
								<Button variant="default" size="sm" asChild title="Share on Twitter">
									<a
										href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
											blog.title
										)}&url=${encodeURIComponent(shareUrl)}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Twitter className="w-3.5 h-3.5" />
										Share
									</a>
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={async () => {
										try {
											await navigator.clipboard.writeText(shareUrl);
											toast.success("Link copied to clipboard!");
										} catch {
											toast.error("Failed to copy link");
										}
									}}
									title="Copy Link"
								>
									<LinkIcon className="w-3.5 h-3.5" />
									Copy Link
								</Button>
							</div>
						</div>

						<h1 className="text-4xl font-bold text-foreground mb-6">{blog.title}</h1>

						<div className="blog-content prose prose-zinc max-w-none prose-base dark:prose-invert">
							<ReactMarkdown components={markdownComponents}>
								{markdownContent}
							</ReactMarkdown>
						</div>
					</div>
				</article>

				<Footer />
			</div>
		</>
	);
};

export default BlogPostPage;
