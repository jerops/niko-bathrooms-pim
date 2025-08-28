/**
 * UserAccountService - Enhanced user account data fetching
 * Supports fetching user data by UID and user type for PageGuard
 */

import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export interface UserAccountData {
  id: string;
  email: string;
  name: string;
  userType: 'customer' | 'retailer';
  emailConfirmed: boolean;
  createdAt: string;
  metadata: Record<string, any>;
  
  // Extended fields for personalization
  profile?: {
    displayName?: string;
    company?: string;
    phone?: string;
    preferences?: Record<string, any>;
  };
  
  // Webflow CMS integration data
  webflowData?: {
    cmsId?: string;
    syncStatus?: 'synced' | 'pending' | 'failed';
    lastSync?: string;
  };
}

export interface UserFetchOptions {
  includeWebflowData?: boolean;
  includeProfile?: boolean;
  useCache?: boolean;
  cacheTimeout?: number; // in milliseconds
}

export class UserAccountService {
  private supabase: SupabaseClient;
  private cache: Map<string, { data: UserAccountData; timestamp: number }> = new Map();
  private defaultCacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get user account data by UID and user type
   * Primary method for PageGuard authentication
   */
  async getUserAccountData(
    uid: string, 
    userType: string, 
    options: UserFetchOptions = {}
  ): Promise<UserAccountData | null> {
    
    const cacheKey = `${uid}-${userType}`;
    const cacheTimeout = options.cacheTimeout || this.defaultCacheTimeout;
    
    // Check cache if enabled
    if (options.useCache !== false) {
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cacheTimeout) {
        console.log('UserAccountService: Returning cached data for', uid);
        return cached.data;
      }
    }
    
    try {
      // 1. Get user from Supabase Auth
      const { data: { user }, error } = await this.supabase.auth.admin.getUserById(uid);
      
      if (error || !user) {
        console.error('UserAccountService: Failed to fetch user', error);
        return null;
      }
      
      // 2. Verify user type matches
      const metadataUserType = user.user_metadata?.user_type || user.user_metadata?.role;
      if (metadataUserType !== userType) {
        console.error('UserAccountService: User type mismatch', {
          expected: userType,
          actual: metadataUserType
        });
        return null;
      }
      
      // 3. Build base account data
      const accountData: UserAccountData = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        userType: userType as 'customer' | 'retailer',
        emailConfirmed: !!user.email_confirmed_at,
        createdAt: user.created_at,
        metadata: user.user_metadata || {}
      };
      
      // 4. Fetch additional profile data if requested
      if (options.includeProfile) {
        accountData.profile = await this.fetchUserProfile(uid);
      }
      
      // 5. Fetch Webflow CMS data if requested
      if (options.includeWebflowData) {
        accountData.webflowData = await this.fetchWebflowData(uid, userType);
      }
      
      // 6. Cache the result
      if (options.useCache !== false) {
        this.cache.set(cacheKey, {
          data: accountData,
          timestamp: Date.now()
        });
      }
      
      console.log('UserAccountService: Successfully fetched account data for', user.email);
      return accountData;
      
    } catch (error) {
      console.error('UserAccountService: Error fetching user account data', error);
      return null;
    }
  }

  /**
   * Fetch user profile from custom profiles table
   */
  private async fetchUserProfile(uid: string): Promise<UserAccountData['profile'] | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('display_name, company, phone, preferences')
        .eq('user_id', uid)
        .single();
      
      if (error || !data) {
        console.warn('UserAccountService: No profile data found for user', uid);
        return undefined;
      }
      
      return {
        displayName: data.display_name,
        company: data.company,
        phone: data.phone,
        preferences: data.preferences
      };
      
    } catch (error) {
      console.warn('UserAccountService: Error fetching profile data', error);
      return undefined;
    }
  }

  /**
   * Fetch Webflow CMS synchronization data
   */
  private async fetchWebflowData(uid: string, userType: string): Promise<UserAccountData['webflowData'] | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('webflow_users')
        .select('webflow_id, sync_status, last_sync')
        .eq('user_id', uid)
        .eq('user_type', userType)
        .single();
      
      if (error || !data) {
        console.warn('UserAccountService: No Webflow data found for user', uid);
        return undefined;
      }
      
      return {
        cmsId: data.webflow_id,
        syncStatus: data.sync_status,
        lastSync: data.last_sync
      };
      
    } catch (error) {
      console.warn('UserAccountService: Error fetching Webflow data', error);
      return undefined;
    }
  }

  /**
   * Update user profile data
   */
  async updateUserProfile(
    uid: string, 
    profileData: Partial<UserAccountData['profile']>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .upsert({
          user_id: uid,
          display_name: profileData.displayName,
          company: profileData.company,
          phone: profileData.phone,
          preferences: profileData.preferences,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('UserAccountService: Error updating profile', error);
        return false;
      }
      
      // Clear cache for this user
      this.clearUserCache(uid);
      
      return true;
      
    } catch (error) {
      console.error('UserAccountService: Error updating user profile', error);
      return false;
    }
  }

  /**
   * Validate user exists and has correct type
   */
  async validateUser(uid: string, expectedUserType: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await this.supabase.auth.admin.getUserById(uid);
      
      if (error || !user) {
        return false;
      }
      
      const userType = user.user_metadata?.user_type || user.user_metadata?.role;
      return userType === expectedUserType;
      
    } catch {
      return false;
    }
  }

  /**
   * Get user permissions based on role
   */
  async getUserPermissions(uid: string, userType: string): Promise<string[]> {
    const permissions: string[] = [];
    
    // Base permissions for all authenticated users
    permissions.push('view_products', 'manage_wishlist');
    
    // Role-specific permissions
    if (userType === 'retailer') {
      permissions.push(
        'view_trade_pricing',
        'place_orders',
        'manage_customers',
        'view_analytics'
      );
    } else if (userType === 'customer') {
      permissions.push(
        'view_public_pricing',
        'contact_retailers'
      );
    }
    
    return permissions;
  }

  /**
   * Clear cache for specific user or all users
   */
  clearUserCache(uid?: string): void {
    if (uid) {
      // Clear cache entries for specific user
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(uid));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Search users by email or name (admin function)
   */
  async searchUsers(query: string, userType?: string): Promise<UserAccountData[]> {
    try {
      // This would typically require admin privileges
      // Implementation depends on your Supabase RLS policies
      
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          company,
          phone
        `)
        .ilike('display_name', `%${query}%`);
      
      if (error || !data) {
        console.warn('UserAccountService: Search failed', error);
        return [];
      }
      
      // Convert to UserAccountData format
      // This is a simplified version - you'd need to join with auth.users
      return data.map(profile => ({
        id: profile.user_id,
        email: '', // Would need to fetch from auth.users
        name: profile.display_name || 'User',
        userType: (userType as 'customer' | 'retailer') || 'customer',
        emailConfirmed: true,
        createdAt: '',
        metadata: {},
        profile: {
          displayName: profile.display_name,
          company: profile.company,
          phone: profile.phone
        }
      }));
      
    } catch (error) {
      console.error('UserAccountService: Error searching users', error);
      return [];
    }
  }
}