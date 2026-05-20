import { Resend } from "resend";

function client() {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const resend = client();
  if (!resend) {
    console.warn("Resend not configured. Email skipped:", input.subject);
    return;
  }
  await resend.emails.send({ from: process.env.EMAIL_FROM!, to: [input.to], subject: input.subject, html: input.html });
}

export async function sendOrderSubmitted(input: { to: string; orderId: string; productTitle: string; amount: string; downloadUrl?: string }) {
  await sendEmail({
    to: input.to,
    subject: "Elevated Library order submitted",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Order submitted</h2><p>Your order is pending manual verification.</p><p><b>Product:</b> ${input.productTitle}</p><p><b>Amount:</b> ${input.amount}</p><p><b>Order:</b> ${input.orderId}</p>${input.downloadUrl ? `<p>Guest link after verification: <a href="${input.downloadUrl}">${input.downloadUrl}</a></p>` : ""}<p>Need help? Message Elevated Library on Facebook.</p></div>`
  });
}

export async function sendVerifiedEmail(input: { to: string; productTitle: string; downloadUrl?: string }) {
  await sendEmail({
    to: input.to,
    subject: "Your Elevated Library PDF is ready",
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Your order is verified</h2><p>Your PDF is ready: <b>${input.productTitle}</b>.</p>${input.downloadUrl ? `<p><a href="${input.downloadUrl}">Download your PDF</a></p>` : `<p>Please login to your dashboard to download.</p>`}</div>`
  });
}

export async function notifyAdmin(input: { subject: string; html: string }) {
  const email = process.env.ADMIN_EMAIL;
  if (!email) return;
  await sendEmail({ to: email, subject: input.subject, html: input.html });
}
