"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeConfigProvider } from "@/lib/theme/ThemeConfigContext";

export function ThemeProvider({ children }) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
			<ThemeConfigProvider>{children}</ThemeConfigProvider>
		</NextThemesProvider>
	);
}
