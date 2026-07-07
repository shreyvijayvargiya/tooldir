import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { DEFAULT_THEME_CONFIG } from "./theme-presets";
import { applyThemeConfig, loadThemeConfig, saveThemeConfig } from "./apply-theme";

const ThemeConfigContext = createContext(null);

export function ThemeConfigProvider({ children }) {
	const { resolvedTheme } = useTheme();
	const [config, setConfig] = useState(DEFAULT_THEME_CONFIG);
	const [customizerOpen, setCustomizerOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = loadThemeConfig();
		if (stored) setConfig({ ...DEFAULT_THEME_CONFIG, ...stored });
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		applyThemeConfig(config, resolvedTheme === "dark" ? "dark" : "light");
		saveThemeConfig(config);
	}, [config, resolvedTheme, mounted]);

	const updateConfig = useCallback((updates) => {
		setConfig((prev) => ({ ...prev, ...updates }));
	}, []);

	const resetConfig = useCallback(() => {
		setConfig(DEFAULT_THEME_CONFIG);
	}, []);

	return (
		<ThemeConfigContext.Provider
			value={{
				config,
				updateConfig,
				resetConfig,
				customizerOpen,
				setCustomizerOpen,
				mounted,
			}}
		>
			{children}
		</ThemeConfigContext.Provider>
	);
}

export function useThemeConfig() {
	const ctx = useContext(ThemeConfigContext);
	if (!ctx) throw new Error("useThemeConfig must be used within ThemeConfigProvider");
	return ctx;
}
