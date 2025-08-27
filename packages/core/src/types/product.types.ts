/**
 * Product-related type definitions for Niko Bathrooms PIM
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  category: string;
  subcategory?: string;
  price?: number;
  sku?: string;
  availability: 'in_stock' | 'out_of_stock' | 'discontinued';
  tags?: string[];
  specifications?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  availability?: Product['availability'];
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  search?: string;
}

export interface ProductSearchResult {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: ProductFilter;
}

export interface ProductComparison {
  id: string;
  userId: string;
  products: Product[];
  createdAt: Date;
  name?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product?: Product;
  addedAt: Date;
  notes?: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  items: WishlistItem[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  sharedWith?: string[];
}