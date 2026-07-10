import { useQuery } from "@tanstack/react-query";
import { getPricingSlotsMap } from "../api/pricingSlots";

export const usePricingSlots = (options = {}) => {
	return useQuery({
		queryKey: ["pricingSlots"],
		queryFn: getPricingSlotsMap,
		staleTime: 60 * 1000,
		...options,
	});
};
