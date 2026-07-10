export const getSlotPricing = (date) => {
	const day = date.getDay();
	const isWeekend = day === 0 || day === 6;
	const dayOfMonth = date.getDate();

	if (isWeekend) {
		return {
			price: 149,
			label: "Weekend Featured",
			description: "Prime weekend visibility with homepage feature and newsletter mention.",
			isPaid: true,
			perks: ["Homepage feature", "Newsletter blast", "Social share", "Trending badge"],
		};
	}

	if (dayOfMonth <= 7) {
		return {
			price: 0,
			label: "Early Bird Free",
			description: "Free launch slot for the first week of the month. Limited availability.",
			isPaid: false,
			perks: ["Directory listing", "Search indexing", "Basic analytics"],
		};
	}

	if (dayOfMonth >= 20) {
		return {
			price: 99,
			label: "Premium Launch",
			description: "High-visibility slot with trending placement and community spotlight.",
			isPaid: true,
			perks: ["Trending placement", "Category feature", "Launch tweet", "Analytics dashboard"],
		};
	}

	return {
		price: 49,
		label: "Standard Launch",
		description: "Solid visibility for your tool launch with directory listing and tags.",
		isPaid: true,
		perks: ["Directory listing", "Category tags", "Search indexing", "Submit badge"],
	};
};

/** Static plans shown on the public pricing page */
export const PRICING_PLANS = [
	{
		id: "standard",
		name: "Standard Launch",
		price: 49,
		period: "one-time",
		description: "Solid visibility for your tool launch with directory listing and tags.",
		pointerTitle: "Best for first launches",
		featured: false,
		cta: "Choose Standard",
		perks: [
			"Directory listing",
			"Category tags",
			"Search indexing",
			"Submit badge",
			"Basic analytics",
		],
		details:
			"Get listed in the ToolDir catalog with category tags, search indexing, and a verified submit badge. Ideal when you want clean discovery without a premium push.",
	},
	{
		id: "premium",
		name: "Premium Launch",
		price: 99,
		period: "one-time",
		description: "High-visibility slot with trending placement and community spotlight.",
		pointerTitle: "Most popular · trending boost",
		featured: true,
		cta: "Choose Premium",
		perks: [
			"Everything in Standard",
			"Trending placement",
			"Category feature",
			"Launch tweet",
			"Analytics dashboard",
		],
		details:
			"Premium puts your tool in trending and category features, shares a launch tweet, and unlocks an analytics dashboard so you can track clicks and referrals.",
	},
	{
		id: "weekend",
		name: "Weekend Featured",
		price: 149,
		period: "one-time",
		description: "Prime weekend visibility with homepage feature and newsletter mention.",
		pointerTitle: "Max reach · homepage + newsletter",
		featured: false,
		cta: "Choose Weekend",
		perks: [
			"Everything in Premium",
			"Homepage feature",
			"Newsletter blast",
			"Social share pack",
			"Trending badge",
		],
		details:
			"Weekend Featured is our highest-reach plan: homepage placement, newsletter blast, social shares, and a trending badge for peak founder traffic.",
	},
];

export const formatDateKey = (date) => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

export const getCalendarDays = (year, month) => {
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const startPad = firstDay.getDay();
	const days = [];

	for (let i = 0; i < startPad; i++) {
		days.push(null);
	}

	for (let d = 1; d <= lastDay.getDate(); d++) {
		days.push(new Date(year, month, d));
	}

	return days;
};

export const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

export const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
