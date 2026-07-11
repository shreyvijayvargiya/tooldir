import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en" suppressHydrationWarning>
			<Head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" sizes="any" />
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
				<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
				<link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
				<meta name="theme-color" content="#0C77E9" />
			</Head>
			<body suppressHydrationWarning>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}

