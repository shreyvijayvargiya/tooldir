import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../app/frontend/Navbar";
import Footer from "../app/frontend/Footer";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Search } from "lucide-react";
import { usePublishedBlogs } from "@/lib/hooks/useBlogs";
import { getBlogPostPath } from "@/lib/utils/blogContent";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/utils/formatDate";

const BlogPage = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const { data: blogs = [], isLoading } = usePublishedBlogs();

	const filteredBlogs = blogs.filter((blog) =>
		blog.title?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	

	const formatDate = (date) => {
		if (!date) return "N/A";
		const value = date?.toDate ? date.toDate().toISOString() : date;
		return formatDisplayDate(value);
	};

	return (
		<>
			<Head>
				<title>Blog | ToolDir — AI Tool Directory</title>
				<meta
					name="description"
					content="Read the latest articles on AI tools, product launches, and directory growth from the ToolDir team."
				/>
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />

				<section className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="text-center mb-12">
							<h1 className="text-4xl font-bold text-foreground mb-4">Blog</h1>
							<p className="text-lg text-muted-foreground">
								Latest articles, updates, and insights
							</p>
						</div>

						{/* Search */}
						<div className="flex justify-end mb-8">
							<div className="relative w-fit">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Search blog posts..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="min-w-[250px] pl-10 w-fit"
								/>
							</div>
						</div>

						{/* Blog List */}
						{isLoading ? (
							<div className="text-center py-12 text-muted-foreground">Loading...</div>
						) : filteredBlogs.length === 0 ? (
							<div className="text-center py-12 text-muted-foreground">
								{searchQuery
									? "No blog posts found matching your search."
									: "No blog posts yet. Check back soon!"}
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{filteredBlogs.map((blog, index) => (
									<motion.div
										key={blog.id}
										initial={false}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
									>
										<Card className="flex flex-col h-full hover:shadow-md transition-all">
											<CardContent className="p-6 flex flex-col flex-1">
												{blog.bannerImage && (
													<img
														src={blog.bannerImage}
														alt={blog.title}
														className="w-full h-48 object-cover rounded-xl mb-4"
													/>
												)}
												<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
													<Calendar className="w-3 h-3" />
													{formatDate(blog.createdAt)}
													{blog.author && (
														<>
															<span>•</span>
															<span>{blog.author}</span>
														</>
													)}
												</div>
												<h2 className="text-xl font-bold text-foreground mb-3 flex-1">
													{blog.title}
												</h2>
												<Button
													variant="link"
													asChild
													className="p-0 h-auto justify-start mt-auto"
												>
													<Link href={getBlogPostPath(blog)}>
														Read More
														<ArrowRight className="w-4 h-4" />
													</Link>
												</Button>
											</CardContent>
										</Card>
									</motion.div>
								))}
							</div>
						)}
					</div>
				</section>

				<Footer />
			</div>
		</>
	);
};

export default BlogPage;
