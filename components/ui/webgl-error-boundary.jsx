import React from "react";
import { cn } from "@/lib/utils";

export class WebGLErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch() {
		/* swallow WebGL runtime errors */
	}

	render() {
		if (this.state.hasError) {
			return this.props.fallback ?? null;
		}
		return this.props.children;
	}
}

export function WebGLFallback({ className, isDark = false }) {
	return (
		<div
			className={cn(
				"absolute inset-0",
				isDark
					? "bg-gradient-to-br from-zinc-950 via-slate-950 to-blue-950"
					: "bg-gradient-to-br from-sky-50 via-white to-blue-100",
				className
			)}
			aria-hidden
		/>
	);
}
