import { config } from "../../config/config";
import { logger } from "../logging/logger";

interface SaleLineItem {
  sku: string;
  description: string;
  qty: number;
  price?: number;
}

interface CustomerInfo {
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  county: string;
  postcode: string;
}

interface SaleNotificationOptions {
  orderRef: string;
  customer: CustomerInfo;
  items: SaleLineItem[];
  total?: number;
}

/**
 * Send new sale notification email to office staff
 * Uses Brevo template ID 1 (FAB Defense office notification)
 */
export async function sendSaleNotificationToOffice(
  options: SaleNotificationOptions,
): Promise<boolean> {
  const apiKey = process.env.BREVO_EMAIL_API_KEY;

  if (!apiKey) {
    logger.error("Missing Brevo API Key");
    return false;
  }

  if (!options.customer || !options.orderRef || !options.items) {
    logger.error("Missing required sale data for email");
    return false;
  }

  try {
    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "New Sale",
        templateId: 1,
        to: config.emailTo,
        params: {
          title: options.customer.title || "",
          firstname: options.customer.firstName,
          lastname: options.customer.lastName,
          address1: options.customer.address1,
          city: options.customer.city,
          county: options.customer.county,
          postcode: options.customer.postcode,
          phone: options.customer.phone,
          email: options.customer.email,
          lines: options.items,
          orderID: options.orderRef,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error("Email API error:", result);
      return false;
    }

    logger.info(`Office sale notification sent for order: ${options.orderRef}`);
    return true;
  } catch (error) {
    logger.error(error, "Error sending office sale notification email:");
    return false;
  }
}

/**
 * Send order confirmation email to customer
 * Uses Brevo template ID 6 (FAB Defense customer confirmation)
 */
export async function sendOrderConfirmationToCustomer(
  options: SaleNotificationOptions,
): Promise<boolean> {
  const apiKey = process.env.BREVO_EMAIL_API_KEY;

  if (!apiKey) {
    logger.error("Missing Brevo API Key");
    return false;
  }

  if (!options.customer || !options.orderRef || !options.items) {
    logger.error("Missing required sale data for email");
    return false;
  }

  try {
    const response = await fetch("https://api.sendinblue.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "New Sale",
        templateId: 6,
        to: [
          {
            name: `${options.customer.firstName} ${options.customer.lastName}`,
            email: options.customer.email,
          },
        ],
        params: {
          firstname: options.customer.firstName,
          lastname: options.customer.lastName,
          address1: options.customer.address1,
          city: options.customer.city,
          county: options.customer.county,
          postcode: options.customer.postcode,
          phone: options.customer.phone,
          email: options.customer.email,
          lines: options.items,
          orderID: options.orderRef,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      logger.error(result, "Customer email API error:");
      return false;
    }

    logger.info(
      `Customer order confirmation sent to: ${options.customer.email} for order: ${options.orderRef}`,
    );
    return true;
  } catch (error) {
    logger.error(error, "Error sending customer order confirmation email:");
    return false;
  }
}
