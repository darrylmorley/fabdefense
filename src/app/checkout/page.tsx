import type { Metadata } from "next";
import CheckoutPage from "@/components/checkout/CheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | FAB Defense UK",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Checkout() {
  return (
    <div className="bg-content-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <CheckoutPage />
      </div>
    </div>
  );
}
