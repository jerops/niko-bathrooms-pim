import { WishlistItem, WishlistConfig, WishlistActions } from '../types';
import { supabase } from '@nikobathrooms/core';

export class WishlistManager implements WishlistActions {
  private config: WishlistConfig;
  private storageKey = 'niko-wishlist-items';

  constructor(config: WishlistConfig) {
    this.config = config;
  }

  /**
   * Add product to wishlist
   * Uses both local storage (immediate feedback) and Supabase (persistence)
   */
  async add(productId: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Store in localStorage for anonymous users
        this.addToLocalStorage(productId);
        return true;
      }

      // Add to Supabase for authenticated users
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          product_id: productId,
          user_id: user.id,
          added_at: new Date().toISOString()
        });

      if (!error) {
        // Also update localStorage for immediate UI feedback
        this.addToLocalStorage(productId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  }

  /**
   * Remove product from wishlist
   */
  async remove(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        this.removeFromLocalStorage(productId);
        return true;
      }

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (!error) {
        this.removeFromLocalStorage(productId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  }

  /**
   * Load user's complete wishlist
   */
  async load(): Promise<WishlistItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Return localStorage items for anonymous users
        return this.getFromLocalStorage();
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error loading wishlist:', error);
        return this.getFromLocalStorage();
      }

      return data || [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  }

  /**
   * Clear entire wishlist
   */
  async clear(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        localStorage.removeItem(this.storageKey);
        return true;
      }

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);

      if (!error) {
        localStorage.removeItem(this.storageKey);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  }

  /**
   * Generate shareable wishlist link
   */
  async share(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return '';

      // Create or get existing share token
      const { data, error } = await supabase
        .from('wishlist_shares')
        .select('share_token')
        .eq('user_id', user.id)
        .single();

      if (data?.share_token) {
        return `${window.location.origin}/wishlist/shared/${data.share_token}`;
      }

      // Generate new share token
      const shareToken = this.generateShareToken();
      const { error: insertError } = await supabase
        .from('wishlist_shares')
        .insert({
          user_id: user.id,
          share_token: shareToken,
          created_at: new Date().toISOString()
        });

      if (!insertError) {
        return `${window.location.origin}/wishlist/shared/${shareToken}`;
      }

      return '';
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      return '';
    }
  }

  // Private helper methods
  private addToLocalStorage(productId: string): void {
    const items = this.getLocalStorageItems();
    if (!items.includes(productId)) {
      items.push(productId);
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    }
  }

  private removeFromLocalStorage(productId: string): void {
    const items = this.getLocalStorageItems();
    const filtered = items.filter(id => id !== productId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  private getLocalStorageItems(): string[] {
    try {
      const items = localStorage.getItem(this.storageKey);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  }

  private getFromLocalStorage(): WishlistItem[] {
    return this.getLocalStorageItems().map(productId => ({
      id: `local-${productId}`,
      productId,
      productSlug: productId,
      userId: 'local',
      addedAt: new Date()
    }));
  }

  private generateShareToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}