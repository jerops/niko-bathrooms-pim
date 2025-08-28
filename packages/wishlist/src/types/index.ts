export interface WishlistItem {
  id: string;
  productId: string;
  productSlug: string;
  userId: string;
  addedAt: Date;
}

export interface WishlistConfig {
  supabaseUrl: string;
  supabaseKey: string;
  webflowSiteId: string;
}

export interface WishlistActions {
  add: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
  load: () => Promise<WishlistItem[]>;
  clear: () => Promise<boolean>;
  share: () => Promise<string>;
}