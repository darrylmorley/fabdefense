/**
 * Worldpay Access Events Webhook Types
 * Based on: https://developer.worldpay.com/products/events
 */

export type WorldpayEventClassification = "payment" | "payout" | "chargeback";

export type WorldpayPaymentEventType =
  | "sentForAuthorization"
  | "authorized"
  | "refused"
  | "sentForSettlement"
  | "settled"
  | "settlementFailed"
  | "sentForCancellation"
  | "cancelled"
  | "cancelledByCustomer"
  | "sentForRefund"
  | "refunded"
  | "refundFailed"
  | "chargedBack"
  | "tokenCreated"
  | "requestExpired"
  | "error"
  | "expired";

export interface WorldpayEventAmount {
  value: number;
  currencyCode: string;
}

export interface WorldpayEventDetails {
  classification: WorldpayEventClassification;
  downstreamReference: string;
  transactionReference: string;
  type: WorldpayPaymentEventType;
  date: string;
  amount?: WorldpayEventAmount;
  octReference?: string;
  _links?: {
    payment?: { href: string };
  };
}

export interface WorldpayEvent {
  eventId: string;
  eventTimestamp: string;
  eventDetails: WorldpayEventDetails;
}
