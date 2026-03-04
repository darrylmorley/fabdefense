import type {
  WorldpayEvent,
  WorldpayPaymentEventType,
} from "@/types/worldpay";
import {
  completeOrder,
  cancelOrder,
  markOrderRefused,
} from "@/lib/orders/completeOrder";
import { logger } from "@/lib/logging/logger";

const WORLDPAY_WEBHOOK_IPS = new Set([
  "34.246.73.11",
  "52.215.22.123",
  "52.31.61.0",
  "18.130.125.132",
  "35.176.91.145",
  "52.56.235.128",
  "18.185.7.67",
  "18.185.134.117",
  "18.185.158.215",
  "52.48.6.187",
  "34.243.65.63",
  "3.255.13.18",
  "3.251.36.74",
  "63.32.208.6",
  "52.19.45.138",
  "3.11.50.124",
  "3.11.213.43",
  "3.14.190.43",
  "3.121.172.32",
  "3.125.11.252",
  "3.126.98.120",
  "3.139.153.185",
  "3.139.255.63",
  "13.200.51.10",
  "13.200.56.25",
  "13.232.151.127",
  "34.236.63.10",
  "34.253.172.98",
  "35.170.209.108",
  "35.177.246.6",
  "52.4.68.25",
  "52.51.12.88",
  "108.129.30.203",
]);

function getClientIP(request: Request): string | null {
  // Use the rightmost X-Forwarded-For entry — it is appended by our own
  // infrastructure (reverse proxy / load balancer) and cannot be spoofed by
  // the client, unlike the leftmost entry which is client-supplied.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[ips.length - 1].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP.trim();

  return null;
}

async function processPaymentEvent(
  eventType: WorldpayPaymentEventType,
  lightspeedId: number,
): Promise<void> {
  switch (eventType) {
    case "authorized":
      await completeOrder(lightspeedId, "webhook");
      break;
    case "refused":
      await markOrderRefused(lightspeedId, "webhook");
      break;
    case "cancelledByCustomer":
    case "cancelled":
      await cancelOrder(lightspeedId, "webhook");
      break;
    case "chargedBack":
      logger.warn(`CHARGEBACK received for order ${lightspeedId}`);
      break;
    default:
      logger.info(`Worldpay event ${eventType} for order ${lightspeedId}`);
      break;
  }
}

export async function POST(request: Request) {
  try {
    // IP verification — fail closed: no detectable IP is rejected
    const clientIP = getClientIP(request);
    if (!clientIP || !WORLDPAY_WEBHOOK_IPS.has(clientIP)) {
      logger.error(`Webhook from unauthorized IP: ${clientIP ?? "unknown"}`);
      return new Response("Unauthorized", { status: 403 });
    }

    let event: WorldpayEvent;
    try {
      const rawBody = await request.text();
      event = JSON.parse(rawBody) as WorldpayEvent;
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    if (!event.eventId || !event.eventDetails) {
      return new Response("Missing required fields", { status: 400 });
    }

    const { eventDetails } = event;

    // Only process payment events
    if (eventDetails.classification !== "payment") {
      return new Response("OK", { status: 200 });
    }

    const lightspeedId = Number(eventDetails.transactionReference);

    if (Number.isNaN(lightspeedId)) {
      logger.error(
        `Invalid transactionReference: ${eventDetails.transactionReference}`,
      );
      return new Response("Invalid transaction reference", { status: 400 });
    }

    logger.info(
      `Worldpay webhook: ${eventDetails.type} for order ${lightspeedId}`,
    );

    // Process asynchronously — respond immediately for Worldpay's 10s timeout
    processPaymentEvent(eventDetails.type, lightspeedId).catch((error) => {
      logger.error({ error, lightspeedId, eventType: eventDetails.type }, "Async webhook processing failed");
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    logger.error(error, "Webhook processing error:");
    // Return 200 to prevent Worldpay retries
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return new Response("Worldpay webhook endpoint active", { status: 200 });
}
