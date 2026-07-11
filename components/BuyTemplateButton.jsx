import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const GUMROAD_URL =
	"https://shreyvijayvargiya.gumroad.com/l/nextjs-supabase-directory-boilerplate?layout=profile";

export default function BuyTemplateButton() {
	// Demo dock already includes Buy — hide floating CTA when switcher is on
	if (process.env.NEXT_PUBLIC_PRESET_SWITCHER === "true") return null;

	return (
		<Button
			asChild
			size="sm"
			className="fixed bottom-2 right-2 z-[90] shadow-lg"
		>
			<a
				href={GUMROAD_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				Buy the template
				<ExternalLink className="size-3.5 opacity-80" />
			</a>
		</Button>
	);
}
