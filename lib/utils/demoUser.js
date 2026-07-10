import { setUserCookie, getUserCookie, removeUserCookie } from "./cookies";
import { setCurrentUserEmail, clearCurrentUserEmail } from "./getCurrentUserEmail";

export const DEMO_USER_EMAIL = "demo@tooldir.app";
export const DEMO_USER_PASSWORD = "demo123";

export const DEMO_USER = {
	uid: "demo-user",
	email: DEMO_USER_EMAIL,
	displayName: "Demo User",
	photoURL: null,
	provider: "demo",
};

export const isDemoUser = (user) =>
	user?.provider === "demo" || user?.uid === DEMO_USER.uid;

export const hasActiveDemoSession = () => isDemoUser(getUserCookie());

export const loginAsDemoUser = () => {
	setUserCookie(DEMO_USER);
	setCurrentUserEmail(DEMO_USER.email);
	if (typeof window !== "undefined") {
		window.dispatchEvent(
			new CustomEvent("tooldir:auth", { detail: DEMO_USER }),
		);
	}
	return DEMO_USER;
};

export const logoutDemoUser = () => {
	removeUserCookie();
	clearCurrentUserEmail();
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("tooldir:auth", { detail: null }));
	}
};
