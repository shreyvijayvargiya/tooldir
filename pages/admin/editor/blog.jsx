import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Legacy route — redirects to nested blog editor.
 */
export default function LegacyBlogEditorRedirect() {
	const router = useRouter();
	const { id } = router.query;

	useEffect(() => {
		if (!router.isReady) return;
		if (id) {
			router.replace(`/admin/blogs/${id}`);
		} else {
			router.replace("/admin/blogs/new");
		}
	}, [router, id]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-muted">
			<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
		</div>
	);
}
