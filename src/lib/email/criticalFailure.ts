import { config } from "../../config/config";
import { logger } from "../logging/logger";

interface CriticalFailureOptions {
  orderID?: string;
  failureType:
    | "sale_completion"
    | "sale_creation"
    | "email_exhausted"
    | "email_queue_failed";
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  billingAddress?: {
    address1?: string;
    city?: string;
    county?: string;
    postcode?: string;
  };
  deliveryAddress?: {
    address1?: string;
    city?: string;
    county?: string;
    postcode?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  error?: string;
  details?: string;
}

/**
 * Send critical failure notification when sale processing fails.
 * This is a non-template email constructed in code with full failure details.
 */
export async function sendCriticalFailureNotification(
  options: CriticalFailureOptions,
): Promise<boolean> {
  const apiKey = process.env.BREVO_EMAIL_API_KEY;

  if (!apiKey) {
    logger.error("Missing Brevo API Key");
    return false;
  }

  const actionItems: Record<string, string> = {
    sale_completion:
      "The payment was taken but the sale could not be completed in Lightspeed. Manual intervention is required to create the sale.",
    sale_creation:
      "The sale could not be created in Lightspeed. Check the Lightspeed API status and retry manually.",
    email_exhausted:
      "All email sending attempts have been exhausted. The customer has NOT received their confirmation email.",
    email_queue_failed:
      "The email queue failed to process. Check the email service status.",
  };

  const subject = `CRITICAL: FAB Defense - ${options.failureType.replace(/_/g, " ").toUpperCase()} FAILURE${options.orderID ? ` - Order ${options.orderID}` : ""}`;

  const htmlContent = `
    <h2 style="color: #cc0000;">Critical Failure Notification</h2>
    <p><strong>Failure Type:</strong> ${options.failureType}</p>
    ${options.orderID ? `<p><strong>Order ID:</strong> ${options.orderID}</p>` : ""}
    ${options.error ? `<p><strong>Error:</strong> ${options.error}</p>` : ""}
    ${options.details ? `<p><strong>Details:</strong> ${options.details}</p>` : ""}

    <h3>Action Required</h3>
    <p>${actionItems[options.failureType] || "Unknown failure type. Please investigate immediately."}</p>

    ${
      options.customer
        ? `
    <h3>Customer Information</h3>
    <p>
      Name: ${options.customer.firstName || ""} ${options.customer.lastName || ""}<br>
      Email: ${options.customer.email || "N/A"}<br>
      Phone: ${options.customer.phone || "N/A"}
    </p>`
        : ""
    }

    ${
      options.billingAddress
        ? `
    <h3>Billing Address</h3>
    <p>
      ${options.billingAddress.address1 || ""}<br>
      ${options.billingAddress.city || ""}<br>
      ${options.billingAddress.county || ""}<br>
      ${options.billingAddress.postcode || ""}
    </p>`
        : ""
    }

    ${
      options.items && options.items.length > 0
        ? `
    <h3>Order Items</h3>
    <table border="1" cellpadding="5" cellspacing="0">
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${options.items.map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>&pound;${item.price.toFixed(2)}</td></tr>`).join("")}
    </table>`
        : ""
    }

    <p style="color: #666; font-size: 12px;">This is an automated notification from FAB Defense UK.</p>
  `;

  try {
    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "FAB Defense System",
          email: "system@fabdefense.co.uk",
        },
        to: [{ name: "Admin", email: config.adminEmail }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      logger.error({ result }, "Critical failure email API error:");
      return false;
    }

    logger.error(
      `Critical failure notification sent for: ${options.failureType}`,
    );
    return true;
  } catch (error) {
    logger.error({ error }, "Error sending critical failure notification:");
    return false;
  }
}
