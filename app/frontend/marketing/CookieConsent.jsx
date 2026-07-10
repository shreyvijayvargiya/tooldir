import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const COOKIE_KEY = "tooldir_cookie_consent";

const CookieConsent = () => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const consent = localStorage.getItem(COOKIE_KEY);
		if (!consent) {
			const timer = setTimeout(() => setVisible(true), 1000);
			return () => clearTimeout(timer);
		}
	}, []);

	const accept = () => {
		localStorage.setItem(COOKIE_KEY, "accepted");
		setVisible(false);
	};

	const decline = () => {
		localStorage.setItem(COOKIE_KEY, "declined");
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
			<Card className="max-w-4xl mx-auto shadow-lg border">
				<CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
					<div className="flex-1">
						<p className="text-sm font-medium text-foreground mb-1">
							We use cookies
						</p>
						<p className="text-xs text-muted-foreground">
							We use cookies to improve your experience, analyze traffic, and for
							marketing. See our{" "}
							<Link href="/privacy" className="text-primary hover:underline">
								Privacy Policy
							</Link>
							.
						</p>
					</div>
					<div className="flex gap-2 shrink-0">
						<Button variant="outline" size="sm" onClick={decline}>
							Decline
						</Button>
						<Button size="sm" onClick={accept}>
							Accept
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default CookieConsent;
