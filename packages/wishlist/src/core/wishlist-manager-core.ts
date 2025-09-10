/**
 * Core Wishlist Manager
 * Essential wishlist functionality for immediate loading
 */

import { WishlistItem, WishlistConfig } from '../types';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@nikobathrooms/core';

export class WishlistManagerCore {
    private config: WishlistConfig;
    private supabase: any;
  private storageKey = 'niko-wishlist-items';

        constructor(config: WishlistConfig) {
    this.config = config;
    this.supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
  }

  /**
   * Get configuration (for unified manager access)
   */
  getConfig(): WishlistConfig {
    return this.config;
  }

  /**
   * Add product to wishlist (core functionality)
   * Uses both local storage (immediate feedback) and Supabase (persistence)
   */
  async add(productId: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        // Store in localStorage for anonymous users
        this.addToLocalStorage(productId);
        return true;
      }

      // Add to Supabase for authenticated users
      const { error } = await this.supabase
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
   * Remove product from wishlist (core functionality)
   */
  async remove(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        this.removeFromLocalStorage(productId);
        return true;
      }

      const { error } = await this.supabase
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
   * Check if product is in wishlist (core functionality)
   */
  async has(productId: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return this.getLocalStorageItems().includes(productId);
      }

      const { data } = await this.supabase
        .from('wishlist_items')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return this.getLocalStorageItems().includes(productId);
    }
  }

  /**
   * Get wishlist count (core functionality)
   */
  async getCount(): Promise<number> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return this.getLocalStorageItems().length;
      }

      const { count } = await this.supabase
        .from('wishlist_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return count || 0;
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return this.getLocalStorageItems().length;
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
}
