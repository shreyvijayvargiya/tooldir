/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
	outputFileTracingRoot: path.join(__dirname),
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "lh3.googleusercontent.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "picsum.photos" },
			{ protocol: "https", hostname: "fastly.picsum.photos" },
			{ protocol: "https", hostname: "api.dicebear.com" },
			{ protocol: "https", hostname: "**.supabase.co" },
		],
		minimumCacheTTL: 60,
	},
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Permissions-Policy",
						value: "payment=(self), interest-cohort=()",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
				],
			},
			{
				source: "/api/(.*)",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
				],
			},
		];
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
		}
		return config;
	},
};

module.exports = nextConfig;
