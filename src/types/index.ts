export interface ProductImage {
  itemID: number | null;
  thumbnailUrl: string | null;
  mediumUrl: string | null;
  largeUrl: string | null;
  ordering: number | null;
}

export interface ProductForCard {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  salePrice: number;
  onSale: boolean | null;
  qoh: number;
  lightspeedID: number;
  categoryID: number | null;
  manufacturerName?: string;
  images: ProductImage[];
}

export interface ProductDetail extends ProductForCard {
  sku: string | null;
  gtin: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  manufacturerID: number | null;
  isFeatured: boolean | null;
  isPreorder: boolean | null;
  isOnBackorder: boolean | null;
  manufacturers: {
    name: string;
    slug: string;
  } | null;
  categories: {
    name: string;
    slug: string;
    parentID: number | null;
  } | null;
}

export interface Category {
  id: number;
  lightspeedID: number;
  name: string;
  slug: string;
  description: string | null;
  imageURL: string | null;
  parentID: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface AddressData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  county: string;
}

export interface CartItem {
  id: string;
  lightspeedID: number | null;
  cartID: string;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    slug: string | null;
    lightspeedID: number;
    categoryID: number | null;
    images: ProductImage[];
  };
}

export interface Cart {
  id: string;
  lightspeedID: number | null;
  customerID: number | null;
  sessionToken: string;
  cartItems: CartItem[];
  total: number;
  itemCount: number;
  completed: boolean;
  cancelled: boolean;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  keywords?: string[];
}
