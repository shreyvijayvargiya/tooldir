import { useQuery } from "@tanstack/react-query";
import { getListedTools } from "../api/directoryTools";
import { usePresetOptional } from "../presets/PresetContext";

export const useDirectoryTools = (options = {}) => {
	const presetCtx = usePresetOptional();
	const presetId = presetCtx?.presetId;
	const preferSeed = Boolean(presetCtx?.switcherEnabled);

	return useQuery({
		queryKey: ["directoryTools", presetId || "default", preferSeed],
		queryFn: () => getListedTools({ presetId, preferSeed }),
		staleTime: 60 * 1000,
		...options,
	});
};
