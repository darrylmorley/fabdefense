import { config } from "@/config/config";
import { logger, logError } from "@/lib/logging/logger";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, phone, subject, message } =
      await request.json();

    if (!firstName || !lastName || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.BREVO_EMAIL_API_KEY;

    if (!apiKey) {
      logError("Missing Brevo API Key for contact form", new Error("BREVO_EMAIL_API_KEY is not set"));
      return new Response(JSON.stringify({ error: "Email service unavailable" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const htmlContent = `
      <p><strong>From:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    logger.info({ to: config.emailTo, subject: escapeHtml(subject ?? "") }, "Brevo: sending contact form email");

    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "FAB Defense UK Contact Form",
          email: "noreply@fabdefense.co.uk",
        },
        to: config.emailTo,
        replyTo: {
          name: `${firstName} ${lastName}`,
          email,
        },
        subject: "New FAB Defense Enquiry",
        htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      logError("Brevo API error sending contact form email", error);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    logger.info({ status: response.status }, "Brevo: contact form email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logError("Contact form submission error", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
