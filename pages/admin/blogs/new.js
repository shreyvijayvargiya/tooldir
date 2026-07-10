import dynamic from "next/dynamic";

const BlogEditorView = dynamic(
	() => import("../../../app/admin/views/BlogEditorView"),
	{
		ssr: false,
		loading: () => (
			<div className="min-h-screen flex items-center justify-center bg-muted">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
			</div>
		),
	}
);

export default function NewBlogPage() {
	return <BlogEditorView />;
}
