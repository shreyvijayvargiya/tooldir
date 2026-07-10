import { useQuery } from "@tanstack/react-query";
import { getListedTools } from "../api/directoryTools";

export const useDirectoryTools = (options = {}) => {
	return useQuery({
		queryKey: ["directoryTools"],
		queryFn: getListedTools,
		staleTime: 60 * 1000,
		...options,
	});
};
