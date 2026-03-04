const isProduction = process.env.APP_ENV === "production";

export const FAB_DEFENSE_MANUFACTURER_ID = 55;
export const SITE_SLUG = "FABDEFENSE";

export const config = {
  siteName: "FAB Defense UK",
  siteUrl: process.env.PUBLIC_SITE_URL || "https://www.fabdefense.co.uk",
  URLs: {
    exceptionurl: "/result?accept=exception",
    declineURL: "/result?accept=declined",
    cancelurl: "/result?accept=cancelled",
    acceptURL: "/result?accept=true",
    backurl: "/cart",
  },
  worldPayURL: isProduction
    ? "https://access.worldpay.com/payment_pages"
    : "https://try.access.worldpay.com/payment_pages",
  worldpayScriptURL: isProduction
    ? "https://access.worldpay.com/payment_pages/build/worldpay-payment-pages.js"
    : "https://try.access.worldpay.com/payment_pages/build/worldpay-payment-pages.js",
  worldpayEntity: isProduction
    ? process.env.WORLDPAY_ENTITY
    : process.env.WORLDPAY_ENTITY_TEST,
  worldpayApiKey: isProduction
    ? process.env.WORLDPAY_API_KEY
    : process.env.WORLDPAY_API_KEY_TEST,
  worldpayUser: isProduction
    ? process.env.WORLDPAY_USER
    : process.env.WORLDPAY_USER_TEST,
  worldpayPassword: isProduction
    ? process.env.WORLDPAY_PASSWORD
    : process.env.WORLDPAY_PASSWORD_TEST,
  emailTo: isProduction
    ? [
        { name: "Darryl", email: "darryl@shootingsuppliesltd.co.uk" },
        { name: "Antony", email: "info@shootingsuppliesltd.co.uk" },
        { name: "Staff", email: "staff@shootingsuppliesltd.co.uk" },
      ]
    : [{ name: "Darryl", email: "darryl@shootingsuppliesltd.co.uk" }],
  adminEmail: process.env.ADMIN_EMAIL || "info@fabdefense.co.uk",
};
