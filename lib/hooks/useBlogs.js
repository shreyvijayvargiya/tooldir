import { useQuery } from "@tanstack/react-query";
import { getAllBlogs, getBlogBySlug, getBlogById } from "../api/blog";

export const blogKeys = {
	all: ["blogs"],
	published: ["blogs", "published"],
	bySlug: (slug) => ["blog", "slug", slug],
	byId: (id) => ["blog", "id", id],
};

export const usePublishedBlogs = () =>
	useQuery({
		queryKey: blogKeys.published,
		queryFn: () => getAllBlogs("published"),
		staleTime: 5 * 60 * 1000,
	});

export const useBlogBySlug = (slug) =>
	useQuery({
		queryKey: blogKeys.bySlug(slug),
		queryFn: () => getBlogBySlug(slug),
		enabled: Boolean(slug),
		staleTime: 5 * 60 * 1000,
	});

export const useBlogById = (id) =>
	useQuery({
		queryKey: blogKeys.byId(id),
		queryFn: () => getBlogById(id),
		enabled: Boolean(id),
		staleTime: 5 * 60 * 1000,
	});
