import { getSiteOrigin } from "../lib/utils/blogSeo";

export async function getServerSideProps({ res }) {
	const origin = getSiteOrigin() || "https://tooldir.com";

	const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

	res.setHeader("Content-Type", "text/plain");
	res.write(robots);
	res.end();

	return { props: {} };
}

export default function Robots() {
	return null;
}
