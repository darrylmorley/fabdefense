import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logging/logger";
import ResultClientEffects from "@/components/result/ResultClientEffects";

export const metadata: Metadata = {
  title: "Payment Result | FAB Defense UK",
  robots: {
    index: false,
    follow: false,
  },
};

const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const accept = typeof params.accept === "string" ? params.accept : undefined;
  const cartId = typeof params.cartId === "string" ? params.cartId : undefined;

  const isSuccess = accept === "true";
  const isDeclined = accept === "declined";
  const isCancelled = accept === "cancelled";
  const isException = accept === "exception";

  let orderRef: string | null = null;
  let orderTotal: number | null = null;

  if (isSuccess && cartId) {
    const lightspeedId = Number(cartId);
    if (!Number.isNaN(lightspeedId)) {
      try {
        const cart = await prisma.carts.findFirst({
          where: { lightspeedID: lightspeedId },
          select: {
            lightspeedID: true,
            cartItems: {
              select: { price: true, quantity: true, lightspeedID: true },
            },
          },
        });
        if (cart?.lightspeedID) {
          orderRef = cart.lightspeedID.toString();
          orderTotal = cart.cartItems
            .filter(
              (item) =>
                item.lightspeedID === null ||
                !DELIVERY_LIGHTSPEED_IDS.includes(item.lightspeedID)
            )
            .reduce((sum: number, item) => sum + item.price * item.quantity, 0);
        }
      } catch (err) {
        logger.error(err, "Failed to look up lightspeedID on result page");
      }
    }
  }

  return (
    <>
      <ResultClientEffects
        isSuccess={isSuccess}
        accept={accept}
        cartId={cartId}
        orderRef={orderRef}
        orderTotal={orderTotal}
      />

      <div className="bg-content-bg min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {isSuccess && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-content-text mb-3">
                Order Confirmed
              </h1>

              <p className="text-content-text-secondary mb-2">
                Thank you for your order. Your payment has been processed
                successfully.
              </p>

              {orderRef && (
                <p className="text-content-text font-mono text-sm font-bold mb-3">
                  Order reference:{" "}
                  <span className="text-fab-aqua">#{orderRef}</span>
                </p>
              )}

              <p className="text-content-text-muted text-base mb-8">
                You will receive an email confirmation shortly with your order
                details.
              </p>

              <a
                href="/shop"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
              >
                Continue Shopping
              </a>
            </div>
          )}

          {isDeclined && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-content-text mb-3">
                Payment Declined
              </h1>

              <p className="text-content-text-secondary mb-8">
                Your payment was declined. Please check your card details and try
                again, or use a different payment method.
              </p>

              <a
                href="/checkout"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
              >
                Try Again
              </a>
            </div>
          )}

          {isCancelled && (
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.999L13.732 4.001c-.77-1.333-2.694-1.333-3.464 0L3.34 16.001C2.57 17.335 3.532 19 5.072 19z"
                  />
                </svg>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-content-text mb-3">
                Payment Cancelled
              </h1>

              <p className="text-content-text-secondary mb-8">
                Your payment was cancelled. Your cart items are still saved if
                you&apos;d like to try again.
              </p>

              <a
                href="/checkout"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
              >
                Return to Checkout
              </a>
            </div>
          )}

          {isException && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-content-text mb-3">
                Payment Error
              </h1>

              <p className="text-content-text-secondary mb-2">
                There was an issue processing your payment.
              </p>

              <p className="text-content-text-muted text-base mb-8">
                If you believe your payment was taken, please contact us at{" "}
                <a
                  href="mailto:info@fabdefense.co.uk"
                  className="text-fab-aqua hover:underline"
                >
                  info@fabdefense.co.uk
                </a>{" "}
                before trying again.
              </p>

              <a
                href="/checkout"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
              >
                Try Again
              </a>
            </div>
          )}

          {!isSuccess && !isDeclined && !isCancelled && !isException && (
            <div className="text-center">
              <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase tracking-wider text-content-text mb-3">
                Payment Result
              </h1>

              <p className="text-content-text-secondary mb-8">
                Something unexpected happened. Please check your email for an
                order confirmation or contact us.
              </p>

              <a
                href="/shop"
                className="inline-block bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-3 px-8 text-sm transition-colors duration-200"
              >
                Continue Shopping
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
