declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: {
        revenue?: { currency: string; amount: number };
        props?: Record<string, string | number>;
      },
    ) => void;
  }
}

export function trackEvent(
  name: string,
  options?: {
    revenue?: { currency: string; amount: number };
    props?: Record<string, string | number>;
  },
) {
  if (typeof window !== "undefined" && typeof window.plausible === "function") {
    window.plausible(name, options);
  }
}
