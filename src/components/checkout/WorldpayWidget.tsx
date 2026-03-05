"use client";
import { captureClientError } from "@/lib/clientError";

import { useEffect, useRef, useState } from "react";
import { config } from "@/config/config";


declare global {
  interface Window {
    WPCL?: {
      Library: new () => {
        setup(options: {
          url: string;
          type: "iframe";
          inject: "immediate";
          target: string;
          accessibility?: boolean;
          debug?: boolean;
          resultCallback?: (response: { order?: { status?: string } }) => void;
        }): void;
      };
    };
  }
}

interface Props {
  worldpayUrl: string;
  cartId: number;
}

export default function WorldpayWidget({ worldpayUrl, cartId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    console.log(
      {
        worldpayUrl,
        cartId,
        initialized: initializedRef.current,
      },
      "WorldpayWidget useEffect triggered:",
    );

    if (!worldpayUrl || initializedRef.current) return;
    initializedRef.current = true;

    console.log("Starting to load Worldpay script...");
    console.log(
      {
        url: config.worldpayScriptURL,
      },
      "Using script URL:",
    );

    // Load the WPCL library script
    const script = document.createElement("script");
    script.id = "worldpay-uiframe";
    script.src =
      "https://payments.worldpay.com/resources/hpp/integrations/embedded/js/hpp-embedded-integration-library.js";
    script.async = true;

    console.log(
      {
        src: script.src,
      },
      "Loading Worldpay library from:",
    );

    script.onload = () => {
      console.log(
        {
          loaded: true,
        },
        "Worldpay library loaded successfully",
      );
      console.log(
        {
          available: typeof window.WPCL !== "undefined",
        },
        "WPCL available:",
      );

      try {
        if (!window.WPCL) {
          setError(
            "Payment library failed to load. Please refresh and try again.",
          );
          setIsLoading(false);
          return;
        }

        console.log(
          {
            url: worldpayUrl,
          },
          "Initializing WPCL with URL:",
        );

        try {
          const worldpay = new window.WPCL.Library();

          worldpay.setup({
            url: worldpayUrl,
            type: "iframe",
            inject: "immediate",
            target: "worldpay-payment-container",
            accessibility: true,
            debug: false,
            resultCallback: (responseData) => {
              console.log(
                {
                  result: responseData,
                },
                "Worldpay payment result:",
              );

              const status = responseData?.order?.status;

              switch (status) {
                case "success":
                  window.location.href = `/result?accept=true&cartId=${cartId}`;
                  break;
                case "failure":
                  window.location.href = `/result?accept=declined&cartId=${cartId}`;
                  break;
                case "cancelled_by_shopper":
                  window.location.href = `/result?accept=cancelled&cartId=${cartId}`;
                  break;
                case "pending":
                case "exception":
                case "error":
                case "session_expired":
                  window.location.href = `/result?accept=exception&cartId=${cartId}`;
                  break;
                default:
                  captureClientError(status ?? "undefined", "Unknown payment status:");
                  setError("Payment status unknown. Please contact support.");
              }
            },
          });

          console.log("Worldpay setup complete");
        } catch (wpclError) {
          captureClientError("Error creating WPCL instance:", wpclError);
          setError(
            "Failed to initialize payment library. Please refresh and try again.",
          );
          setIsLoading(false);
          return;
        }

        setIsLoading(false);

        // Debug: Check if iframe was created
        setTimeout(() => {
          const container = document.getElementById(
            "worldpay-payment-container",
          );
          if (container) {
            const iframe = container.querySelector("iframe");
            console.log(
              {
                container: container,
              },
              "Container found:",
            );
            console.log(
              {
                iframe: iframe,
              },
              "Iframe found:",
            );
            console.log(
              {
                children: container.children.length,
              },
              "Container children:",
            );
            console.log(
              {
                html: container.innerHTML.substring(0, 200),
              },
              "Container HTML:",
            );

            // Try to manually inject iframe as fallback
            if (!iframe) {
              console.log(
                {
                  attempting: "manual iframe injection",
                },
                "Attempting manual iframe injection...",
              );
              const manualIframe = document.createElement("iframe");
              manualIframe.src = worldpayUrl;
              manualIframe.style.width = "100%";
              manualIframe.style.height = "400px";
              manualIframe.style.border = "none";
              container.appendChild(manualIframe);
              console.log(
                {
                  injected: manualIframe,
                },
                "Manual iframe injected:",
              );
            }
          }
        }, 2000);
      } catch (err) {
        captureClientError("Error initializing Worldpay:", err);
        setError("Failed to initialize payment. Please refresh and try again.");
        setIsLoading(false);
      }
    };

    script.onerror = (error) => {
      captureClientError("Failed to load Worldpay library:", error);
      setError("Failed to load payment system. Please refresh and try again.");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [worldpayUrl, cartId]);

  if (error) {
    return (
      <div className="bg-white border border-content-border p-5">
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4">
          {error}
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider py-2.5 px-6 text-sm transition-colors duration-200"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-content-border p-5">
      <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-content-text mb-4">
        Payment
      </h2>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-6 h-6 text-fab-aqua animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-content-text-muted">
              Loading payment form...
            </span>
          </div>
        </div>
      )}

      <div
        id="worldpay-payment-container"
        className={
          isLoading ? "hidden" : "w-full overflow-hidden"
        }
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
