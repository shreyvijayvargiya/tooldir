import { motion } from "framer-motion";
import dynamic from "next/dynamic";

export const ease = [0.22, 1, 0.36, 1];

export const sectionVariants = {
	hidden: { opacity: 0, y: 48 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease, when: "beforeChildren", staggerChildren: 0.08 },
	},
};

export const itemVariants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.55, ease },
	},
};

export const heroItemVariants = {
	hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: { duration: 0.65, ease },
	},
};

export const viewport = { once: false, amount: 0.2, margin: "-40px 0px" };

export const MotionSection = ({ children, className, id }) => (
	<motion.section
		id={id}
		className={className}
		variants={sectionVariants}
		initial="hidden"
		whileInView="visible"
		viewport={viewport}
	>
		{children}
	</motion.section>
);

const baseGradient = {
	preset: "custom",
	proportion: 55,
	scale: 0.55,
	speed: 12,
	distortion: 24,
	swirl: 50,
	swirlIterations: 8,
	softness: 100,
	offset: 80,
	shape: "Edge",
	shapeSize: 45,
};

/** ToolDir — soft sky blue (current look) */
export const HERO_GRADIENT_LIGHT = {
	...baseGradient,
	color1: "#ffffff",
	color2: "#eef6ff",
	color3: "#7eb8ff",
	rotation: -40,
};

export const HERO_GRADIENT_DARK = {
	...baseGradient,
	color1: "#050810",
	color2: "#0b1a33",
	color3: "#1d6fd8",
	rotation: -40,
};

/** Per-niche animated hero backgrounds */
export const LANDING_HERO_GRADIENTS = {
	"ai-tools": {
		light: HERO_GRADIENT_LIGHT,
		dark: HERO_GRADIENT_DARK,
	},
	"prompt-library": {
		light: {
			...baseGradient,
			color1: "#f7fef9",
			color2: "#d1fae5",
			color3: "#34d399",
			rotation: 25,
			speed: 14,
			swirl: 62,
			distortion: 28,
		},
		dark: {
			...baseGradient,
			color1: "#04140c",
			color2: "#0a2f1c",
			color3: "#10b981",
			rotation: 25,
			speed: 14,
			swirl: 62,
		},
	},
	"design-resources": {
		light: {
			...baseGradient,
			color1: "#fffaf7",
			color2: "#ffe4d6",
			color3: "#fb923c",
			rotation: -55,
			speed: 10,
			swirl: 40,
			proportion: 48,
		},
		dark: {
			...baseGradient,
			color1: "#140a04",
			color2: "#3b1a08",
			color3: "#ea580c",
			rotation: -55,
			speed: 10,
			swirl: 40,
		},
	},
	"ui-inspiration": {
		light: {
			...baseGradient,
			color1: "#faf8ff",
			color2: "#e9d5ff",
			color3: "#a78bfa",
			rotation: 70,
			speed: 16,
			swirl: 70,
			distortion: 32,
			shapeSize: 55,
		},
		dark: {
			...baseGradient,
			color1: "#0c0618",
			color2: "#2e1065",
			color3: "#8b5cf6",
			rotation: 70,
			speed: 16,
			swirl: 70,
			distortion: 32,
		},
	},
	resources: {
		light: {
			...baseGradient,
			color1: "#f8fafc",
			color2: "#e0f2fe",
			color3: "#38bdf8",
			rotation: 10,
			speed: 11,
			swirl: 35,
			proportion: 60,
			shapeSize: 40,
		},
		dark: {
			...baseGradient,
			color1: "#020617",
			color2: "#0c4a6e",
			color3: "#0ea5e9",
			rotation: 10,
			speed: 11,
			swirl: 35,
		},
	},
};

export const getLandingHeroGradients = (presetId) =>
	LANDING_HERO_GRADIENTS[presetId] || LANDING_HERO_GRADIENTS["ai-tools"];

const AnimatedGradient = dynamic(
	() =>
		import("@/components/ui/animated-gradient").then((m) => m.AnimatedGradient),
	{ ssr: false }
);

/** Shared animated mesh backdrop used by every niche landing hero */
export function HeroBackdrop({ presetId = "ai-tools", noiseOpacity = 0.12 }) {
	const { light, dark } = getLandingHeroGradients(presetId);
	return (
		<div className="absolute inset-0 pointer-events-none" aria-hidden>
			<AnimatedGradient
				config={light}
				darkConfig={dark}
				noise={{ opacity: noiseOpacity, scale: 1 }}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
		</div>
	);
}
