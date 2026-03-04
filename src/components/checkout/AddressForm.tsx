"use client";

import { useState, useCallback, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import {
  isValidUKPostcode,
  isNorthernIrelandPostcode,
  cartContainsMagazines,
} from "@/lib/delivery";
import type { AddressData } from "@/types";
import { trackEvent } from "@/lib/analytics";

interface Props {
  onSubmit: (shipping: AddressData, billing: AddressData) => void;
  isSubmitting: boolean;
}

interface PostcodeResult {
  line_1: string;
  line_2?: string;
  line_3?: string;
  post_town: string;
  postcode: string;
  county?: string;
}

const EMPTY_ADDRESS: AddressData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  postcode: "",
  county: "",
};

const REQUIRED_FIELDS: (keyof AddressData)[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "address1",
  "city",
  "postcode",
];

const FIELD_LABELS: Record<keyof AddressData, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email Address",
  phone: "Phone Number",
  address1: "Address Line 1",
  address2: "Address Line 2",
  city: "City / Town",
  postcode: "Postcode",
  county: "County",
};

function AddressFields({
  address,
  onChange,
  errors,
  prefix,
  onSearchPostcode,
  isSearching,
  postcodeResults,
  showResults,
  onSelectAddress,
}: {
  address: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  errors: Partial<Record<keyof AddressData, string>>;
  prefix: string;
  onSearchPostcode: () => void;
  isSearching: boolean;
  postcodeResults: PostcodeResult[];
  showResults: boolean;
  onSelectAddress: (result: PostcodeResult) => void;
}) {
  const fieldOrder: (keyof AddressData)[] = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "postcode",
    "address1",
    "address2",
    "city",
    "county",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fieldOrder.map((field) => {
        const isRequired = REQUIRED_FIELDS.includes(field);
        const isFullWidth = [
          "email",
          "phone",
          "address1",
          "address2",
          "postcode",
        ].includes(field);
        const inputType =
          field === "email"
            ? "email"
            : field === "phone"
              ? "tel"
              : "text";

        // Postcode field gets special treatment with search button + dropdown
        if (field === "postcode") {
          return (
            <div key={field} className="sm:col-span-2 relative">
              <label
                htmlFor={`${prefix}-${field}`}
                className="block text-sm font-medium text-content-text mb-1"
              >
                {FIELD_LABELS[field]}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id={`${prefix}-${field}`}
                  name={`${prefix}-${field}`}
                  value={address[field]}
                  onChange={(e) =>
                    onChange(field, e.target.value.toUpperCase())
                  }
                  required
                  autoComplete="postal-code"
                  placeholder="e.g. SW1A 1AA"
                  className={`flex-1 bg-white border rounded px-3 py-2.5 text-sm text-content-text placeholder:text-content-text-muted focus:outline-none transition-colors ${
                    errors[field]
                      ? "border-red-500 focus:border-red-500"
                      : "border-content-border focus:border-fab-aqua"
                  }`}
                />
                <button
                  type="button"
                  onClick={onSearchPostcode}
                  disabled={
                    address.postcode.length < 5 ||
                    !isValidUKPostcode(address.postcode) ||
                    isSearching
                  }
                  className="bg-fab-aqua hover:bg-fab-aqua-hover text-white font-bold uppercase tracking-wider px-4 py-2.5 text-xs transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                >
                  {isSearching ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
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
                      Searching
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      Find Address
                    </>
                  )}
                </button>
              </div>
              {errors[field] && (
                <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
              )}

              {/* Postcode results dropdown */}
              {showResults && postcodeResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-content-border shadow-lg max-h-60 overflow-auto">
                  <div className="px-3 py-2 text-xs text-content-text-muted border-b border-content-border bg-gray-50">
                    {postcodeResults.length} address
                    {postcodeResults.length !== 1 ? "es" : ""} found
                  </div>
                  {postcodeResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => onSelectAddress(result)}
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 border-b border-content-border last:border-b-0 transition-colors"
                    >
                      <span className="text-sm text-content-text">
                        {[
                          result.line_1,
                          result.line_2,
                          result.post_town,
                          result.postcode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={field} className={isFullWidth ? "sm:col-span-2" : ""}>
            <label
              htmlFor={`${prefix}-${field}`}
              className="block text-sm font-medium text-content-text mb-1"
            >
              {FIELD_LABELS[field]}
              {isRequired && (
                <span className="text-red-500 ml-0.5">*</span>
              )}
            </label>
            <input
              type={inputType}
              id={`${prefix}-${field}`}
              name={`${prefix}-${field}`}
              value={address[field]}
              onChange={(e) => onChange(field, e.target.value)}
              required={isRequired}
              autoComplete={
                field === "firstName"
                  ? "given-name"
                  : field === "lastName"
                    ? "family-name"
                    : field === "email"
                      ? "email"
                      : field === "phone"
                        ? "tel"
                        : field === "address1"
                          ? "address-line1"
                          : field === "address2"
                            ? "address-line2"
                            : field === "city"
                              ? "address-level2"
                              : field === "county"
                                ? "address-level1"
                                : "off"
              }
              className={`w-full bg-white border rounded px-3 py-2.5 text-sm text-content-text placeholder:text-content-text-muted focus:outline-none transition-colors ${
                errors[field]
                  ? "border-red-500 focus:border-red-500"
                  : "border-content-border focus:border-fab-aqua"
              }`}
              placeholder={FIELD_LABELS[field]}
            />
            {errors[field] && (
              <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AddressForm({ onSubmit, isSubmitting }: Props) {
  const { cart, estimateDelivery } = useCart();
  const [shipping, setShipping] = useState<AddressData>({ ...EMPTY_ADDRESS });
  const [billing, setBilling] = useState<AddressData>({ ...EMPTY_ADDRESS });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof AddressData, string>>
  >({});
  const [billingErrors, setBillingErrors] = useState<
    Partial<Record<keyof AddressData, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);

  // Load saved delivery details from session storage on mount
  useEffect(() => {
    if (!cart?.id) return;

    const sessionKey = `checkout-details-${cart.id}`;
    const saved = sessionStorage.getItem(sessionKey);

    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (parsedData.shipping) {
          setShipping(parsedData.shipping);
        }
        if (parsedData.billing) {
          setBilling(parsedData.billing);
        }
        if (typeof parsedData.billingSameAsShipping === "boolean") {
          setBillingSameAsShipping(parsedData.billingSameAsShipping);
        }
      } catch (error) {
        console.warn("Failed to parse saved checkout details:", error);
      }
    }
  }, [cart?.id]);

  // Save delivery details to session storage
  const saveToSessionStorage = useCallback(() => {
    if (!cart?.id) return;

    const sessionKey = `checkout-details-${cart.id}`;
    const dataToSave = {
      shipping,
      billing,
      billingSameAsShipping,
    };

    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn("Failed to save checkout details to session storage:", error);
    }
  }, [cart?.id, shipping, billing, billingSameAsShipping]);

  // Debounce session storage saves to prevent excessive writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToSessionStorage();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [saveToSessionStorage]);

  // Postcode search state
  const [postcodeResults, setPostcodeResults] = useState<PostcodeResult[]>([]);
  const [showPostcodeResults, setShowPostcodeResults] = useState(false);
  const [searchingPostcode, setSearchingPostcode] = useState(false);
  const [activeAddressType, setActiveAddressType] = useState<
    "shipping" | "billing"
  >("shipping");

  const handleShippingChange = useCallback(
    (field: keyof AddressData, value: string) => {
      setShipping((prev) => ({ ...prev, [field]: value }));
      setShippingErrors((prev) => ({ ...prev, [field]: undefined }));
      setFormError(null);
      // Close postcode results when user edits postcode
      if (field === "postcode") {
        setShowPostcodeResults(false);
      }
    },
    [],
  );

  // Estimate delivery when shipping postcode changes
  useEffect(() => {
    if (shipping.postcode && isValidUKPostcode(shipping.postcode)) {
      estimateDelivery(shipping.postcode);
    } else if (shipping.postcode) {
      // Clear estimate for invalid postcodes
      estimateDelivery("");
    }
  }, [shipping.postcode, estimateDelivery]);

  const handleBillingChange = useCallback(
    (field: keyof AddressData, value: string) => {
      setBilling((prev) => ({ ...prev, [field]: value }));
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
      if (field === "postcode") {
        setShowPostcodeResults(false);
      }
    },
    [],
  );

  const searchPostcode = useCallback(
    async (postcode: string, addressType: "shipping" | "billing") => {
      if (postcode.length < 5 || !isValidUKPostcode(postcode)) return;

      setSearchingPostcode(true);
      setActiveAddressType(addressType);

      try {
        const response = await fetch(
          `/api/addresses/search?postcode=${encodeURIComponent(postcode)}`,
        );

        if (response.ok) {
          const data = await response.json();
          const addresses: PostcodeResult[] = (data.result || []).sort(
            (a: PostcodeResult, b: PostcodeResult) =>
              a.line_1.localeCompare(b.line_1, "en", {
                numeric: true,
                sensitivity: "base",
              }),
          );
          trackEvent("Postcode Search", {
            props: { result_count: addresses.length },
          });
          if (addresses.length > 0) {
            setPostcodeResults(addresses);
            setShowPostcodeResults(true);
          } else {
            setPostcodeResults([]);
            setShowPostcodeResults(false);
            if (addressType === "shipping") {
              setShippingErrors((prev) => ({
                ...prev,
                postcode:
                  "No addresses found for this postcode. Please enter your address manually.",
              }));
            } else {
              setBillingErrors((prev) => ({
                ...prev,
                postcode:
                  "No addresses found for this postcode. Please enter your address manually.",
              }));
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg =
            errorData.error || "Error searching postcode. Please try again.";
          if (addressType === "shipping") {
            setShippingErrors((prev) => ({ ...prev, postcode: errorMsg }));
          } else {
            setBillingErrors((prev) => ({ ...prev, postcode: errorMsg }));
          }
        }
      } catch {
        const errorMsg =
          "Error searching postcode. Please enter your address manually.";
        if (addressType === "shipping") {
          setShippingErrors((prev) => ({ ...prev, postcode: errorMsg }));
        } else {
          setBillingErrors((prev) => ({ ...prev, postcode: errorMsg }));
        }
      } finally {
        setSearchingPostcode(false);
      }
    },
    [],
  );

  const selectAddress = useCallback(
    (result: PostcodeResult, addressType: "shipping" | "billing") => {
      const addressData = {
        address1: result.line_1,
        address2: result.line_2 || "",
        city: result.post_town,
        postcode: result.postcode,
        county: result.county || "",
      };

      if (addressType === "shipping") {
        setShipping((prev) => ({ ...prev, ...addressData }));
        setShippingErrors({});
      } else {
        setBilling((prev) => ({ ...prev, ...addressData }));
        setBillingErrors({});
      }

      setShowPostcodeResults(false);
      setPostcodeResults([]);
    },
    [],
  );

  const validate = useCallback((): boolean => {
    let isValid = true;
    const newShippingErrors: Partial<Record<keyof AddressData, string>> = {};
    const newBillingErrors: Partial<Record<keyof AddressData, string>> = {};

    // Validate shipping required fields
    for (const field of REQUIRED_FIELDS) {
      if (!shipping[field].trim()) {
        newShippingErrors[field] = `${FIELD_LABELS[field]} is required`;
        isValid = false;
      }
    }

    // Validate email format
    if (
      shipping.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)
    ) {
      newShippingErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate UK postcode
    if (shipping.postcode && !isValidUKPostcode(shipping.postcode)) {
      newShippingErrors.postcode = "Please enter a valid UK postcode";
      isValid = false;
    }

    // Magazine + NI check
    if (
      shipping.postcode &&
      isNorthernIrelandPostcode(shipping.postcode) &&
      cart &&
      cartContainsMagazines(cart.cartItems)
    ) {
      trackEvent("NI Restriction Hit");
      setFormError(
        "Unfortunately, magazine products cannot be delivered to Northern Ireland. Please remove magazine items from your cart or use a mainland UK delivery address.",
      );
      isValid = false;
    }

    // Validate billing if separate
    if (!billingSameAsShipping) {
      for (const field of REQUIRED_FIELDS) {
        if (!billing[field].trim()) {
          newBillingErrors[field] = `${FIELD_LABELS[field]} is required`;
          isValid = false;
        }
      }

      if (
        billing.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)
      ) {
        newBillingErrors.email = "Please enter a valid email address";
        isValid = false;
      }

      if (billing.postcode && !isValidUKPostcode(billing.postcode)) {
        newBillingErrors.postcode = "Please enter a valid UK postcode";
        isValid = false;
      }
    }

    setShippingErrors(newShippingErrors);
    setBillingErrors(newBillingErrors);
    return isValid;
  }, [shipping, billing, billingSameAsShipping, cart]);

  const handleSubmit = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const finalBilling = billingSameAsShipping ? { ...shipping } : billing;
      onSubmit(shipping, finalBilling);
    },
    [shipping, billing, billingSameAsShipping, validate, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-white border border-content-border p-5">
        <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-content-text mb-4">
          Delivery Address
        </h2>

        <AddressFields
          address={shipping}
          onChange={handleShippingChange}
          errors={shippingErrors}
          prefix="shipping"
          onSearchPostcode={() => searchPostcode(shipping.postcode, "shipping")}
          isSearching={searchingPostcode && activeAddressType === "shipping"}
          postcodeResults={
            activeAddressType === "shipping" ? postcodeResults : []
          }
          showResults={showPostcodeResults && activeAddressType === "shipping"}
          onSelectAddress={(result) => selectAddress(result, "shipping")}
        />
      </div>

      {/* Billing address toggle */}
      <div className="bg-white border border-content-border p-5 mt-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={billingSameAsShipping}
            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
            className="w-4 h-4 text-fab-aqua border-content-border rounded focus:ring-fab-aqua"
          />
          <span className="text-sm text-content-text">
            Billing address same as delivery
          </span>
        </label>

        {!billingSameAsShipping && (
          <div className="mt-4 pt-4 border-t border-content-border">
            <h2 className="font-heading text-lg font-bold uppercase tracking-wider text-content-text mb-4">
              Billing Address
            </h2>

            <AddressFields
              address={billing}
              onChange={handleBillingChange}
              errors={billingErrors}
              prefix="billing"
              onSearchPostcode={() =>
                searchPostcode(billing.postcode, "billing")
              }
              isSearching={
                searchingPostcode && activeAddressType === "billing"
              }
              postcodeResults={
                activeAddressType === "billing" ? postcodeResults : []
              }
              showResults={
                showPostcodeResults && activeAddressType === "billing"
              }
              onSelectAddress={(result) => selectAddress(result, "billing")}
            />
          </div>
        )}
      </div>

      {/* Form error */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 mt-4">
          {formError}
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full mt-4 bg-fab-aqua text-white font-bold uppercase tracking-wider py-3.5 text-sm transition-colors duration-200 ${
          isSubmitting ? "opacity-75 cursor-wait" : "hover:bg-fab-aqua-hover"
        }`}
      >
        {isSubmitting ? "Processing..." : "Continue to Payment"}
      </button>
    </form>
  );
}
