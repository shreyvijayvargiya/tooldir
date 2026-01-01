import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/api/supabase";

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		const handleAuthCallback = async () => {
			try {
				// Handle the OAuth callback
				const { data, error } = await supabase.auth.getSession();

				if (error) {
					console.error("Auth callback error:", error);
					router.push("/?error=auth_failed");
					return;
				}

				if (data?.session?.user) {
					// Save user to Supabase users table
					const user = data.session.user;
					const provider = user.app_metadata?.provider || "google";

					// Import and save user
					const { saveUser } = await import("../../lib/api/users");
					await saveUser({
						uid: user.id,
						email: user.email,
						name:
							user.user_metadata?.name ||
							user.user_metadata?.display_name ||
							user.email?.split("@")[0] ||
							"User",
						display_name:
							user.user_metadata?.display_name ||
							user.user_metadata?.name ||
							user.email?.split("@")[0] ||
							"User",
						provider: provider,
						photo_url:
							user.user_metadata?.avatar_url ||
							user.user_metadata?.picture ||
							null,
						email_verified: !!user.email_confirmed_at,
						last_sign_in: user.last_sign_in_at || new Date().toISOString(),
					});

					// Redirect to home page
					router.push("/?success=logged_in");
				} else {
					router.push("/?error=no_session");
				}
			} catch (error) {
				console.error("Error handling auth callback:", error);
				router.push("/?error=auth_failed");
			}
		};

		handleAuthCallback();
	}, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
				<p className="mt-4 text-zinc-600">Completing sign in...</p>
			</div>
		</div>
	);
}
