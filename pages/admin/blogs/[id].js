import dynamic from "next/dynamic";
import { useRouter } from "next/router";

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

export default function EditBlogPage() {
	const router = useRouter();
	const { id } = router.query;

	if (!router.isReady) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-muted">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
			</div>
		);
	}

	return <BlogEditorView blogId={id} />;
}
