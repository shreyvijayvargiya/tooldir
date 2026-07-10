import { useEffect, useState } from "react";

/**
 * Renders children only after mount to avoid SSR/client mismatches.
 */
export default function ClientOnly({ children, fallback = null }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return fallback;
	return children;
}
