import { prisma } from "../prisma";
import {
  MAGAZINE_CATEGORY_IDS,
  RESTRICTED_ITEMS,
  RESTRICTED_CATEGORIES,
} from "../constants";
import { DELIVERY_PRODUCTS } from "../delivery";
import { logger } from "../logging/logger";

export type CartItem = {
  id: string;
  lightspeedID: number | null;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  cartID: string;
  product?: {
    id: number;
    lightspeedID: number;
    categoryID: number | null;
    name: string;
    slug: string | null;
    price: number;
    salePrice: number;
    onSale: boolean | null;
    qoh: number;
    images: Array<{
      id: string;
      thumbnailUrl: string | null;
      mediumUrl: string | null;
    }>;
    manufacturers: {
      name: string;
    } | null;
  } | null;
};

export type Cart = {
  id: string;
  lightspeedID: number | null;
  sessionToken: string | null;
  customerID: number | null;
  createdAt: Date;
  updatedAt: Date;
  completed: boolean;
  cancelled: boolean;
  website: string;
  cartItems: CartItem[];
  total: number;
  itemCount: number;
};

const cartInclude = {
  cartItems: {
    include: {
      product: {
        select: {
          id: true,
          lightspeedID: true,
          categoryID: true,
          name: true,
          slug: true,
          price: true,
          salePrice: true,
          onSale: true,
          qoh: true,
          images: {
            take: 1,
            orderBy: {
              ordering: "asc" as const,
            },
          },
          manufacturers: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  },
};

export async function getCartBySession(
  sessionToken: string,
): Promise<Cart | null> {
  try {
    const cart = await prisma.carts.findFirst({
      where: {
        sessionToken: sessionToken,
        completed: false,
        cancelled: false,
      },
      include: cartInclude,
    });

    if (!cart) return null;

    const total = cart.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const itemCount = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return { ...cart, total, itemCount };
  } catch (error) {
    logger.error(error, "Error getting cart by session:");
    throw new Error(
      `Failed to get cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

async function createCart(sessionToken: string): Promise<Cart> {
  try {
    const cart = await prisma.carts.create({
      data: {
        sessionToken: sessionToken,
        website: "FABDEFENSE",
      },
      include: cartInclude,
    });

    return { ...cart, total: 0, itemCount: 0 };
  } catch (createError) {
    if ((createError as { code?: string }).code === "P2002") {
      const existingCart = await prisma.carts.findFirst({
        where: { sessionToken: sessionToken, completed: false, cancelled: false },
        include: cartInclude,
      });

      if (existingCart) {
        return {
          ...existingCart,
          total: existingCart.cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          ),
          itemCount: existingCart.cartItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
        };
      }

      throw new Error(
        "Session expired. Please refresh the page to start a new cart.",
      );
    }
    throw createError;
  }
}

export async function addItemToCart(
  sessionToken: string,
  productId: number,
  quantity: number = 1,
) {
  try {
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        lightspeedID: true,
        categoryID: true,
        price: true,
        salePrice: true,
        onSale: true,
        qoh: true,
        archived: true,
      },
    });

    if (!product || product.archived) {
      throw new Error("Product not found or not available");
    }

    if (
      product.lightspeedID &&
      RESTRICTED_ITEMS.includes(product.lightspeedID)
    ) {
      throw new Error("This item can only be purchased in-store");
    }

    if (
      product.categoryID !== null &&
      product.categoryID !== undefined &&
      RESTRICTED_CATEGORIES.includes(product.categoryID)
    ) {
      throw new Error("This item can only be purchased in-store");
    }

    if (!isDeliveryItem(product.lightspeedID) && product.qoh < quantity) {
      throw new Error(`Only ${product.qoh} items available in stock`);
    }

    let cart = await getCartBySession(sessionToken);
    if (!cart) {
      cart = await createCart(sessionToken);
    }

    const isProductMagazine =
      product.categoryID !== null &&
      product.categoryID !== undefined &&
      MAGAZINE_CATEGORY_IDS.includes(product.categoryID);
    const isProductNIDelivery =
      product.lightspeedID ===
      DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID;

    const cartHasNIDelivery = cart.cartItems.some(
      (item) =>
        item.lightspeedID ===
        DELIVERY_PRODUCTS.NORTHERN_IRELAND_OFFSHORE.lightspeedID,
    );
    const cartHasMagazines = cart.cartItems.some(
      (item) =>
        item.product?.categoryID !== null &&
        item.product?.categoryID !== undefined &&
        MAGAZINE_CATEGORY_IDS.includes(item.product.categoryID),
    );

    if (isProductMagazine && cartHasNIDelivery) {
      throw new Error(
        "Magazines cannot be shipped to Northern Ireland. Please remove the Northern Ireland/Offshore delivery option to add this product.",
      );
    }

    if (isProductNIDelivery && cartHasMagazines) {
      throw new Error(
        "Northern Ireland delivery cannot be selected when your cart contains magazines.",
      );
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartID: cart.id, lightspeedID: product.lightspeedID },
    });

    const currentPrice = product.onSale ? product.salePrice : product.price;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (!isDeliveryItem(product.lightspeedID) && product.qoh < newQuantity) {
        throw new Error(`Only ${product.qoh} items available in stock`);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: currentPrice,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartID: cart.id,
          lightspeedID: product.lightspeedID,
          quantity,
          price: currentPrice,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    await prisma.carts.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return await getCartBySession(sessionToken);
  } catch (error) {
    logger.error(error, "Error adding to cart:");
    throw new Error(
      `Failed to add item to cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function updateCartItem(
  sessionToken: string,
  cartItemId: string,
  quantity: number,
) {
  try {
    if (quantity <= 0) {
      return await removeFromCart(sessionToken, cartItemId);
    }

    const cart = await getCartBySession(sessionToken);
    if (!cart) throw new Error("No active cart found");

    const cartItem = cart.cartItems.find((item) => item.id === cartItemId);
    if (!cartItem) throw new Error("Cart item not found");
    if (!cartItem.lightspeedID)
      throw new Error("Cart item has no associated product");

    const product = await prisma.products.findUnique({
      where: { lightspeedID: cartItem.lightspeedID },
      select: {
        id: true,
        lightspeedID: true,
        categoryID: true,
        qoh: true,
        archived: true,
      },
    });

    if (!product || product.archived) {
      throw new Error("Product is no longer available");
    }

    if (
      product.lightspeedID &&
      RESTRICTED_ITEMS.includes(product.lightspeedID)
    ) {
      throw new Error("This item can only be purchased in-store");
    }

    if (
      product.categoryID !== null &&
      product.categoryID !== undefined &&
      RESTRICTED_CATEGORIES.includes(product.categoryID)
    ) {
      throw new Error("This item can only be purchased in-store");
    }

    if (product.qoh < quantity) {
      throw new Error(`Only ${product.qoh} items available in stock`);
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, updatedAt: new Date() },
    });

    await prisma.carts.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return await getCartBySession(sessionToken);
  } catch (error) {
    logger.error(error, "Error updating cart item:");
    throw new Error(
      `Failed to update cart item: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function removeFromCart(sessionToken: string, cartItemId: string) {
  try {
    const cart = await getCartBySession(sessionToken);
    if (!cart) throw new Error("No active cart found");

    const cartItem = cart.cartItems.find((item) => item.id === cartItemId);
    if (!cartItem) throw new Error("Cart item not found");

    const isRemovingDeliveryItem = isDeliveryItem(cartItem.lightspeedID);

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    if (!isRemovingDeliveryItem) {
      const remainingItems = cart.cartItems.filter(
        (item) => item.id !== cartItemId,
      );
      const hasNonDeliveryItems = remainingItems.some(
        (item) => !isDeliveryItem(item.lightspeedID),
      );

      if (!hasNonDeliveryItems) {
        const deliveryItems = remainingItems.filter(
          (item) => item.lightspeedID && isDeliveryItem(item.lightspeedID),
        );
        for (const item of deliveryItems) {
          await prisma.cartItem.delete({ where: { id: item.id } });
        }
      }
    }

    await prisma.carts.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return await getCartBySession(sessionToken);
  } catch (error) {
    logger.error(error, "Error removing from cart:");
    throw new Error(
      `Failed to remove item from cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function isDeliveryItem(lightspeed_id: number | null): boolean {
  const DELIVERY_LIGHTSPEED_IDS = [7476, 8403, 8461];
  return (
    lightspeed_id !== null && DELIVERY_LIGHTSPEED_IDS.includes(lightspeed_id)
  );
}

/**
 * Returns the authoritative current price for a cart item.
 * Uses the live product price (already loaded via cartInclude) rather than
 * the stored snapshot in cartItem.price, preventing stale-price exploits.
 * Falls back to stored price for delivery items (product is null).
 */
export function getCurrentItemPrice(item: CartItem): number {
  if (!item.product) return item.price; // delivery item — trust stored price
  return item.product.onSale ? item.product.salePrice : item.product.price;
}

export async function removeDeliveryItems(sessionToken: string) {
  try {
    const cart = await getCartBySession(sessionToken);
    if (!cart) return 0;

    const deliveryItems = cart.cartItems.filter(
      (item) => item.lightspeedID && isDeliveryItem(item.lightspeedID),
    );

    for (const item of deliveryItems) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    return deliveryItems.length;
  } catch (error) {
    logger.error(error, "Error removing delivery items:");
    throw new Error("Failed to remove delivery items");
  }
}

export async function setDeliveryItem(
  sessionToken: string,
  deliveryProductId: number,
) {
  try {
    await removeDeliveryItems(sessionToken);
    await addItemToCart(sessionToken, deliveryProductId, 1);
    return await getCartBySession(sessionToken);
  } catch (error) {
    logger.error(error, "Error setting delivery item:");
    throw new Error("Failed to set delivery item");
  }
}

export async function clearCart(sessionToken: string) {
  try {
    const cart = await prisma.carts.findFirst({
      where: { sessionToken: sessionToken },
      include: { cartItems: true },
    });

    if (!cart) throw new Error("Cart not found");

    await prisma.cartItem.deleteMany({ where: { cartID: cart.id } });

    await prisma.carts.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    try {
      return await getCartBySession(sessionToken);
    } catch {
      return { ...cart, cartItems: [], total: 0, itemCount: 0 };
    }
  } catch (error) {
    logger.error(error, "Error clearing cart:");
    throw new Error(
      `Failed to clear cart: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function getCartItemCount(sessionToken: string): Promise<number> {
  try {
    const result = await prisma.cartItem.aggregate({
      where: {
        cart: { sessionToken: sessionToken, completed: false, cancelled: false },
      },
      _sum: { quantity: true },
    });

    return result._sum.quantity || 0;
  } catch (error) {
    logger.error(error, "Error getting cart item count:");
    return 0;
  }
}
