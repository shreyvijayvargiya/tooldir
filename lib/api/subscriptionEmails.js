import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
	? new Resend(process.env.RESEND_API_KEY)
	: null;

const FROM = process.env.RESEND_FROM_EMAIL || "hello@tooldir.app";

const formatMoney = (amountCents, currency = "usd") => {
	const dollars = Number(amountCents || 0) / 100;
	try {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: (currency || "usd").toUpperCase(),
		}).format(dollars);
	} catch {
		return `$${dollars.toFixed(2)}`;
	}
};

const emailShell = ({ title, body }) => `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#111;max-width:560px;margin:0 auto;padding:24px;background:#fafafa;">
  <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#737373;">ToolDir</p>
    <h1 style="font-size:22px;margin:0 0 16px;">${title}</h1>
    ${body}
  </div>
  <p style="margin-top:20px;font-size:12px;color:#737373;text-align:center;">Sent by ToolDir · Launch slots &amp; directory listings</p>
</body>
</html>`;

/**
 * Sample / production receipt after a launch-slot payment succeeds.
 * Amount is in cents (same as Stripe + payments.amount).
 */
export async function sendSlotPaymentEmail({
	customerEmail,
	customerName = "there",
	toolName,
	slotLabel,
	launchDate,
	amountCents = 0,
	currency = "usd",
	paymentId,
	submissionId,
}) {
	if (!resend) {
		console.warn("Resend not configured — skipping slot payment email");
		return { skipped: true };
	}
	if (!customerEmail) {
		return { skipped: true, reason: "no email" };
	}

	const html = emailShell({
		title: "Payment received",
		body: `
      <p>Hi ${customerName || "there"},</p>
      <p>Thanks for booking a launch slot on ToolDir. Your payment went through.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">
        <tr><td style="padding:6px 0;color:#737373;">Tool</td><td style="padding:6px 0;text-align:right;"><strong>${toolName || "Your tool"}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#737373;">Slot</td><td style="padding:6px 0;text-align:right;">${slotLabel || "Launch slot"}${launchDate ? ` · ${launchDate}` : ""}</td></tr>
        <tr><td style="padding:6px 0;color:#737373;">Amount</td><td style="padding:6px 0;text-align:right;"><strong>${formatMoney(amountCents, currency)}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#737373;">Payment ID</td><td style="padding:6px 0;text-align:right;font-family:monospace;font-size:12px;">${paymentId || "N/A"}</td></tr>
      </table>
      <p style="font-size:14px;color:#525252;">We'll review your submission shortly. You can track status from your dashboard.</p>
      ${submissionId ? `<p style="font-size:12px;color:#a3a3a3;">Reference: ${submissionId}</p>` : ""}
    `,
	});

	return resend.emails.send({
		from: FROM,
		to: [customerEmail],
		subject: `Payment confirmed — ${toolName || slotLabel || "ToolDir"}`,
		html,
	});
}

/** @deprecated Use sendSlotPaymentEmail — kept as alias for older imports */
export const sendSubscriptionConfirmationEmail = sendSlotPaymentEmail;

export async function sendSubscriptionCancellationEmail() {
	console.warn("sendSubscriptionCancellationEmail removed — no subscriptions");
	return { skipped: true };
}

export async function sendSubscriptionUpgradeEmail() {
	console.warn("sendSubscriptionUpgradeEmail removed — no subscriptions");
	return { skipped: true };
}
