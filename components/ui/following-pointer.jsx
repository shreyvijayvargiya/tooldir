"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({ children, className, title }) => {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const ref = React.useRef(null);
	const [isInside, setIsInside] = useState(false);

	const handleMouseMove = (e) => {
		if (!ref.current) return;
		const bounds = ref.current.getBoundingClientRect();
		x.set(e.clientX - bounds.left);
		y.set(e.clientY - bounds.top);
	};

	return (
		<div
			ref={ref}
			onMouseLeave={() => setIsInside(false)}
			onMouseEnter={() => setIsInside(true)}
			onMouseMove={handleMouseMove}
			style={{ cursor: "none" }}
			className={cn("relative", className)}
		>
			<AnimatePresence>
				{isInside && <FollowPointer x={x} y={y} title={title} />}
			</AnimatePresence>
			{children}
		</div>
	);
};

export const FollowPointer = ({ x, y, title }) => {
	const colors = [
		"rgb(14 165 233)",
		"rgb(115 115 115)",
		"rgb(20 184 166)",
		"rgb(34 197 94)",
		"rgb(59 130 246)",
		"rgb(239 68 68)",
		"rgb(234 179 8)",
	];
	const color = colors[Math.floor(Math.random() * colors.length)];

	return (
		<motion.div
			className="absolute z-50 h-4 w-4 rounded-full"
			style={{
				top: y,
				left: x,
				pointerEvents: "none",
			}}
			initial={{ scale: 1, opacity: 1 }}
			animate={{ scale: 1, opacity: 1 }}
			exit={{ scale: 0, opacity: 0 }}
		>
			<svg
				stroke="currentColor"
				fill="currentColor"
				strokeWidth="1"
				viewBox="0 0 16 16"
				className="h-6 w-6 -translate-x-[12px] -rotate-[70deg] transform stroke-sky-600 text-sky-500"
				height="1em"
				width="1em"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
			</svg>
			<motion.div
				style={{ backgroundColor: color }}
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.5, opacity: 0 }}
				className="min-w-max whitespace-nowrap rounded-full px-2 py-1.5 text-xs text-white"
			>
				{title || "Details"}
			</motion.div>
		</motion.div>
	);
};

/** Demo export kept for reference — prefer FollowerPointerCard directly */
export function FollowingPointerDemo() {
	return null;
}
