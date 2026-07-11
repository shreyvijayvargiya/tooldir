import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import "../styles/globals.css";
import { store, persistor } from "../lib/store/store";
import SEO from "../lib/modules/SEO";
import AnalyticsTracker from "../lib/ui/AnalyticsTracker";
import PostHogProvider from "../lib/ui/PostHogProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeCustomizer } from "@/components/theme/ThemeCustomizer";
import BuyTemplateButton from "@/components/BuyTemplateButton";
import CookieConsent from "../app/frontend/marketing/CookieConsent";
import { isPresetSwitcherEnabled } from "@/lib/presets";

const NicheBookmarkBar = isPresetSwitcherEnabled()
	? dynamic(() => import("@/components/demo/NicheBookmarkBar"), { ssr: false })
	: null;

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			staleTime: 5 * 60 * 1000,
		},
	},
});

const MyApp = ({ Component, pageProps }) => {
	const router = useRouter();
	const isAdminRoute = router.pathname.startsWith("/admin");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const AppComponent = isAdminRoute ? (
		<Component {...pageProps} />
	) : (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<Component {...pageProps} />
				<CookieConsent />
			</PersistGate>
		</Provider>
	);

	return (
		<ThemeProvider>
			<QueryClientProvider client={queryClient}>
				<PostHogProvider>
					<AnalyticsTracker />
					<SEO />
					{AppComponent}
					{/* Portal-based UI can mismatch SSR — mount after hydration */}
					{mounted && (
						<>
							<Toaster position="top-right" richColors closeButton />
							<ThemeCustomizer />
							{NicheBookmarkBar ? <NicheBookmarkBar /> : null}
							<BuyTemplateButton />
						</>
					)}
				</PostHogProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
};

export default MyApp;
