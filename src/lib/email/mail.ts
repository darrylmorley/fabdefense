import { logger } from "../logging/logger";

interface EmailParams {
  [key: string]: string | number | boolean | undefined | null;
}

export async function mail(
  templateId: number,
  email: string,
  name: string,
  params?: EmailParams,
): Promise<boolean> {
  const apiKey = process.env.BREVO_EMAIL_API_KEY;

  if (!apiKey) {
    logger.error("Missing Brevo API Key");
    return false;
  }

  if (!templateId || !email || !name) {
    logger.error({ templateId, email, name }, "Missing required parameters");
    return false;
  }

  const body = JSON.stringify({
    templateId,
    to: [{ name, email }],
    ...(params && { params }),
  });

  try {
    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      logger.error({ error }, "Email API error:");
      return false;
    }

    return true;
  } catch (error) {
    logger.error({ email }, "Error sending email:", error);
    return false;
  }
}
