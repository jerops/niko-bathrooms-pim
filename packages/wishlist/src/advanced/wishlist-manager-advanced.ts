/**
 * Advanced Wishlist Manager
 * Extended wishlist functionality loaded on demand
 */

import { WishlistItem, WishlistConfig } from '../types';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@nikobathrooms/core';

export class AdvancedWishlistManager {
  private config: WishlistConfig;
  private supabase: any;
  private storageKey = 'niko-wishlist-items';

  constructor(config: WishlistConfig) {
    this.config = config;
    this.supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
  }

  /**
   * Load user's complete wishlist with product details
   */
  async load(): Promise<WishlistItem[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        // Return localStorage items for anonymous users
        return this.getFromLocalStorage();
      }

      const { data, error } = await this.supabase
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
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        localStorage.removeItem(this.storageKey);
        return true;
      }

      const { error } = await this.supabase
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
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return '';

      // Create or get existing share token
      const { data, error } = await this.supabase
        .from('wishlist_shares')
        .select('share_token')
        .eq('user_id', user.id)
        .single();

      if (data?.share_token) {
        return `${window.location.origin}/wishlist/shared/${data.share_token}`;
      }

      // Generate new share token
      const shareToken = this.generateShareToken();
      const { error: insertError } = await this.supabase
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

  /**
   * Sync wishlist between devices
   */
  async sync(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      // Get local items
      const localItems = this.getLocalStorageItems();
      
      // Get server items
      const { data: serverItems } = await this.supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user.id);

      const serverProductIds = serverItems?.map(item => item.product_id) || [];

      // Add local items to server
      for (const productId of localItems) {
        if (!serverProductIds.includes(productId)) {
          await this.supabase
            .from('wishlist_items')
            .insert({
              product_id: productId,
              user_id: user.id,
              added_at: new Date().toISOString()
            });
        }
      }

      // Update local storage with server items
      localStorage.setItem(this.storageKey, JSON.stringify(serverProductIds));

      return true;
    } catch (error) {
      console.error('Error syncing wishlist:', error);
      return false;
    }
  }

  /**
   * Get wishlist analytics
   */
  async getAnalytics(): Promise<{
    totalItems: number;
    categories: Record<string, number>;
    mostAdded: string[];
    lastUpdated: Date;
  }> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return {
          totalItems: 0,
          categories: {},
          mostAdded: [],
          lastUpdated: new Date()
        };
      }

      const { data } = await this.supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id);

      // Process analytics
      const totalItems = data?.length || 0;
      const categories: Record<string, number> = {};
      const mostAdded: string[] = [];

      // This would typically join with product data for categories
      // For now, return basic structure
      return {
        totalItems,
        categories,
        mostAdded,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting wishlist analytics:', error);
      return {
        totalItems: 0,
        categories: {},
        mostAdded: [],
        lastUpdated: new Date()
      };
    }
  }

  // Private helper methods
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
