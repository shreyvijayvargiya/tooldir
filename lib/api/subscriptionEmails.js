import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const formatMoney = (amount, currency = "usd") =>
	`${(Number(amount || 0) / 100).toFixed(2)} ${(currency || "usd").toUpperCase()}`;

const formatDate = (value) => {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

const emailShell = ({ title, body }) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
  ${body}
  <p style="margin-top: 32px; font-size: 12px; color: #666;">Sent by ToolDir</p>
</body>
</html>`;

/**
 * Send payment confirmation email after Stripe checkout
 */
export async function sendSubscriptionConfirmationEmail({
	customerEmail,
	customerName = "Customer",
	planName,
	amount,
	currency = "usd",
	paymentId,
	expiresAt,
}) {
	const nextBilling = formatDate(expiresAt);
	const html = emailShell({
		title: "Payment confirmed",
		body: `
      <p>Hi ${customerName || "there"},</p>
      <p>Your payment for <strong>${planName || "your plan"}</strong> was received.</p>
      <ul>
        <li>Amount: ${formatMoney(amount, currency)}</li>
        <li>Payment ID: ${paymentId || "N/A"}</li>
        ${nextBilling ? `<li>Next billing date: ${nextBilling}</li>` : ""}
      </ul>
    `,
	});

	const data = await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL || "hello@tooldir.app",
		to: [customerEmail],
		subject: `Payment Confirmed — ${planName || "ToolDir"}`,
		html,
	});

	return data;
}

/**
 * Send cancellation confirmation email
 */
export async function sendSubscriptionCancellationEmail({
	customerEmail,
	customerName = "Customer",
	planName,
	expiresAt,
}) {
	const accessUntil = formatDate(expiresAt);
	const html = emailShell({
		title: "Subscription cancelled",
		body: `
      <p>Hi ${customerName || "there"},</p>
      <p>Your <strong>${planName || "plan"}</strong> subscription has been cancelled.</p>
      ${accessUntil ? `<p>Access continues until ${accessUntil}.</p>` : ""}
    `,
	});

	const data = await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL || "hello@tooldir.app",
		to: [customerEmail],
		subject: `Subscription Cancelled — ${planName || "ToolDir"}`,
		html,
	});

	return data;
}

/**
 * Send plan upgrade confirmation email
 */
export async function sendSubscriptionUpgradeEmail({
	customerEmail,
	customerName = "Customer",
	oldPlanName,
	newPlanName,
	amount,
	currency = "usd",
	expiresAt,
}) {
	const nextBilling = formatDate(expiresAt);
	const html = emailShell({
		title: "Subscription upgraded",
		body: `
      <p>Hi ${customerName || "there"},</p>
      <p>Your plan moved from <strong>${oldPlanName || "previous plan"}</strong> to <strong>${newPlanName || "new plan"}</strong>.</p>
      <ul>
        <li>New amount: ${formatMoney(amount, currency)}</li>
        ${nextBilling ? `<li>Next billing date: ${nextBilling}</li>` : ""}
      </ul>
    `,
	});

	const data = await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL || "hello@tooldir.app",
		to: [customerEmail],
		subject: `Upgraded to ${newPlanName || "new plan"}`,
		html,
	});

	return data;
}
