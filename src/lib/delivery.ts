import { MAGAZINE_CATEGORY_IDS } from "./constants";

export const DELIVERY_PRODUCTS = {
  MAINLAND_UK: {
    lightspeedID: 7476,
    name: "Mainland UK Delivery",
    description: "Standard delivery to mainland UK addresses",
  },
  NORTHERN_IRELAND_OFFSHORE: {
    lightspeedID: 8403,
    name: "Northern Ireland & Offshore UK Delivery",
    description: "Delivery to Northern Ireland and UK offshore territories",
  },
  RFD: {
    lightspeedID: 8461,
    name: "RFD Delivery",
    description: "Delivery to Registered Firearms Dealers",
  },
} as const;

const NORTHERN_IRELAND_POSTCODES = /^BT\d+/i;

const OFFSHORE_UK_POSTCODES = [
  /^JE\d+/i,
  /^GY\d+/i,
  /^IM\d+/i,
  /^HS\d+/i,
  /^KW1[5-7]/i,
  /^ZE\d+/i,
  /^PA2[0-8]/i,
  /^PA3[0-9]/i,
  /^PA4[0-9]/i,
  /^PA6[0-9]/i,
  /^PA7[0-8]/i,
  /^PH4[1-4]/i,
  /^IV4[0-9]/i,
  /^IV5[0-6]/i,
];

const UK_POSTCODE_FORMAT_REGEX =
  /^[A-Z]{1,2}[0-9][0-9]?[A-Z]?\s*[0-9][A-Z]{2}$/i;

export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode || typeof postcode !== "string") return false;
  return UK_POSTCODE_FORMAT_REGEX.test(postcode.trim());
}

export interface DeliveryInfo {
  product: (typeof DELIVERY_PRODUCTS)[keyof typeof DELIVERY_PRODUCTS];
  isAvailable: boolean;
  reason?: string;
}

export function getDeliveryProduct(postcode: string): DeliveryInfo {
  if (!postcode || typeof postcode !== "string") {
    return {
      product: DELIVERY_PRODUCTS.MAINLAND_UK,
      isAvailable: false,
      reason: "Invalid postcode provided",
    };
  }

  const normalizedPostcode = postcode.trim().toUpperCase();

  if (NORTHERN_IRELAND_POSTCODES.test(normalizedPostcode)) {
    return {
      product: DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE,
      isAvailable: true,
    };
  }

  for (const regex of OFFSHORE_UK_POSTCODES) {
    if (regex.test(normalizedPostcode)) {
      return {
        product: DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE,
        isAvailable: true,
      };
    }
  }

  return {
    product: DELIVERY_PRODUCTS.MAINLAND_UK,
    isAvailable: true,
  };
}

export function isDeliveryAvailable(postcode: string): boolean {
  return getDeliveryProduct(postcode).isAvailable;
}

export function isNorthernIrelandPostcode(postcode: string): boolean {
  if (!postcode || typeof postcode !== "string") return false;
  return NORTHERN_IRELAND_POSTCODES.test(postcode.trim().toUpperCase());
}

export function isMagazineProduct(
  categoryId: number | null | undefined
): boolean {
  if (!categoryId) return false;
  return MAGAZINE_CATEGORY_IDS.includes(categoryId);
}

export function cartContainsMagazines(
  cartItems: Array<{ product?: { categoryID?: number | null } | null }>
): boolean {
  return cartItems.some(
    (item) =>
      item.product?.categoryID && isMagazineProduct(item.product.categoryID)
  );
}
