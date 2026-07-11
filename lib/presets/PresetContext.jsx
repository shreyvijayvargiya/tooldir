import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	DIRECTORY_CONFIG,
} from "@/directory.config";
import {
	DEFAULT_PRESET_ID,
	PRESETS,
	getConfiguredPresetId,
	getPreset,
	isPresetSwitcherEnabled,
} from "@/lib/presets";
import { useThemeConfig } from "@/lib/theme/ThemeConfigContext";
import { ACCENT_COLORS } from "@/lib/theme/theme-presets";

const STORAGE_KEY = "tooldir-active-preset";

const PresetContext = createContext(null);

const resolveInitialId = () => {
	const fromEnv = getConfiguredPresetId();
	if (fromEnv && PRESETS[fromEnv]) return fromEnv;
	const fromFile = DIRECTORY_CONFIG?.preset;
	if (fromFile && PRESETS[fromFile]) return fromFile;
	return DEFAULT_PRESET_ID;
};

export function PresetProvider({ children }) {
	const switcherEnabled = isPresetSwitcherEnabled();
	const lockedId = resolveInitialId();
	const [presetId, setPresetIdState] = useState(lockedId);
	const [mounted, setMounted] = useState(false);
	const { updateConfig } = useThemeConfig();

	useEffect(() => {
		if (switcherEnabled && typeof window !== "undefined") {
			const stored = window.localStorage.getItem(STORAGE_KEY);
			if (stored && PRESETS[stored]) {
				setPresetIdState(stored);
			}
		} else {
			setPresetIdState(lockedId);
		}
		setMounted(true);
	}, [switcherEnabled, lockedId]);

	const setPresetId = useCallback(
		(id) => {
			if (!PRESETS[id]) return;
			if (!switcherEnabled) return;
			setPresetIdState(id);
			if (typeof window !== "undefined") {
				window.localStorage.setItem(STORAGE_KEY, id);
			}
		},
		[switcherEnabled]
	);

	const preset = useMemo(() => getPreset(presetId), [presetId]);

	// Sync niche accent → ThemeCustomizer primary (buttons, rings, submit icon)
	useEffect(() => {
		if (!mounted) return;
		const accent = preset?.theme?.accent;
		if (accent && ACCENT_COLORS[accent]) {
			updateConfig({ accent });
		}
	}, [mounted, presetId, preset?.theme?.accent, updateConfig]);

	const value = useMemo(
		() => ({
			preset,
			presetId,
			setPresetId,
			switcherEnabled,
			mounted,
		}),
		[preset, presetId, setPresetId, switcherEnabled, mounted]
	);

	return (
		<PresetContext.Provider value={value}>{children}</PresetContext.Provider>
	);
}

export function usePreset() {
	const ctx = useContext(PresetContext);
	if (!ctx) {
		throw new Error("usePreset must be used within PresetProvider");
	}
	return ctx;
}

/** Safe hook for components that may render outside provider (SSR edge cases) */
export function usePresetOptional() {
	return useContext(PresetContext);
}
