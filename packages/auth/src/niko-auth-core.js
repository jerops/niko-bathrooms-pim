// Niko Auth Core - Main Authentication System v4.0.0 (Updated for Onboarding Flow)
(function(window) {
    'use strict';
    
    const CONFIG = {
        SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk',
        ROUTES: {
            // Updated routes for onboarding flow
            CUSTOMER_ONBOARDING: '/app/customer/onboarding',
            RETAILER_ONBOARDING: '/app/retailer/onboarding',
            CUSTOMER_DASHBOARD: '/app/customer/dashboard',
            RETAILER_DASHBOARD: '/app/retailer/dashboard',
            LOGIN_PAGE: '/app/auth/log-in'
        }
    };

    class NikoAuthCore {
        constructor() {
            this.supabase = null;
            this.initialized = false;
            this.init();
        }

        async init() {
            console.log('Loading Niko Auth Core v4.0.0 (Onboarding Flow)');
            
            if (typeof supabase === 'undefined') {
                await this.loadSupabase();
            }
            
            this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('Niko Auth Core initialized successfully');
            
            this.setupLogoutHandlers();
            this.checkAuthState();
        }

        isInitialized() {
            return this.initialized;
        }

        loadSupabase() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        /**
         * Get redirect URL for email confirmation based on user type and environment
         */
        getSignupRedirectUrl(userType) {
            const base = document.querySelector('base')?.href || location.origin + '/';
            const isStaging = location.hostname.includes('webflow.io');
            const isDev = location.hostname === 'localhost' || location.pathname.includes('/dev/');
            
            // For new signups, redirect to onboarding
            if (userType === 'Customer' || userType.toLowerCase() === 'customer') {
                return base.replace(/\/$/, '') + CONFIG.ROUTES.CUSTOMER_ONBOARDING;
            } else {
                return base.replace(/\/$/, '') + CONFIG.ROUTES.RETAILER_ONBOARDING;
            }
        }

        /**
         * Get dashboard URL for existing users (login)
         */
        getDashboardUrl(userType) {
            const base = document.querySelector('base')?.href || location.origin + '/';
            
            if (userType === 'Customer' || userType.toLowerCase() === 'customer') {
                return base.replace(/\/$/, '') + CONFIG.ROUTES.CUSTOMER_DASHBOARD;
            } else {
                return base.replace(/\/$/, '') + CONFIG.ROUTES.RETAILER_DASHBOARD;
            }
        }

        async register(email, password, name, userType) {
            console.log('Registering user:', { email, userType });
            
            if (!this.initialized) {
                throw new Error('Authentication system not initialized');
            }

            try {
                // Get redirect URL for onboarding (new signups)
                const redirectUrl = this.getSignupRedirectUrl(userType);
                console.log('Email confirmation will redirect to onboarding:', redirectUrl);

                const { data, error } = await this.supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: {
                        data: {
                            name: name,
                            user_type: userType,
                            role: userType
                        },
                        emailRedirectTo: redirectUrl
                    }
                });

                if (error) {
                    console.error('Registration error:', error);
                    return { success: false, error: error.message };
                }

                console.log('Registration successful:', data.user?.email);
                
                // Create Webflow CMS record
                await this.createWebflowRecord(data.user.id, email, name, userType);
                
                return { success: true, user: data.user };
            } catch (error) {
                console.error('Registration failed:', error);
                return { success: false, error: error.message };
            }
        }

        async login(email, password) {
            console.log('Logging in user:', { email });
            
            if (!this.initialized) {
                throw new Error('Authentication system not initialized');
            }

            try {
                const { data, error } = await this.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    console.error('Login error:', error);
                    return { success: false, error: error.message };
                }

                console.log('Login successful:', data.user?.email);
                return { success: true, user: data.user };
            } catch (error) {
                console.error('Login failed:', error);
                return { success: false, error: error.message };
            }
        }

        async logout() {
            console.log('Logging out user...');
            
            if (!this.initialized) {
                throw new Error('Authentication system not initialized');
            }

            try {
                const { error } = await this.supabase.auth.signOut();
                
                // Clear storage
                localStorage.clear();
                sessionStorage.clear();

                if (error) {
                    console.error('Logout error:', error);
                    return { success: false, error: error.message };
                }

                console.log('Logout successful');
                return { success: true };
            } catch (error) {
                console.error('Logout failed:', error);
                return { success: false, error: error.message };
            }
        }

        async getCurrentUser() {
            if (!this.initialized) return null;

            try {
                const { data: { user }, error } = await this.supabase.auth.getUser();
                if (error) throw error;
                return user;
            } catch (error) {
                console.error('Get user failed:', error);
                return null;
            }
        }

        async isAuthenticated() {
            const user = await this.getCurrentUser();
            return !!user;
        }

        async createWebflowRecord(userId, email, name, userType) {
            try {
                const { data, error } = await this.supabase.functions.invoke('create-webflow-user', {
                    body: {
                        user_id: userId,
                        email: email,
                        name: name,
                        user_type: userType
                    }
                });

                if (error) {
                    console.warn('Webflow integration error (user still created in Supabase):', error);
                } else {
                    console.log('Webflow CMS record created');
                }
            } catch (error) {
                console.warn('Edge function error:', error);
            }
        }

        setupLogoutHandlers() {
            if (typeof document === 'undefined') return;

            const logoutSelectors = [
                '[niko-data="logout"]',
                '[data-logout]',
                '.logout-btn',
                '.logout-button',
                'a[href*="logout"]',
                'button[onclick*="logout"]'
            ];

            const logoutElements = [];
            logoutSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(element => {
                    if (!logoutElements.includes(element)) {
                        logoutElements.push(element);
                    }
                });
            });

            console.log(`Found ${logoutElements.length} logout elements`);

            logoutElements.forEach(element => {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);

                newElement.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Logout button clicked');

                    const originalText = newElement.textContent;
                    try {
                        newElement.textContent = 'Logging out...';
                        newElement.disabled = true;

                        const result = await this.logout();
                        console.log('Logout result:', result);

                        window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
                    } catch (error) {
                        console.error('Logout error:', error);
                        newElement.textContent = originalText;
                        newElement.disabled = false;
                        window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
                    }
                });
            });

            console.log(`Setup ${logoutElements.length} logout handlers`);
        }

        async checkAuthState() {
            if (typeof document === 'undefined') return;

            try {
                const user = await this.getCurrentUser();
                if (user) {
                    this.displayUserInfo(user);
                    console.log('User authenticated:', user.email);
                } else if (this.isProtectedPage()) {
                    console.log('No user found on protected page, redirecting...');
                    window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
                }
            } catch (error) {
                console.error('Auth state check failed:', error);
            }
        }

        displayUserInfo(user) {
            if (typeof document === 'undefined') return;

            const userName = user.user_metadata?.name || user.email.split('@')[0];
            const userRole = user.user_metadata?.user_type || 'Customer';

            const userSelectors = {
                name: ['[data-user="name"]', '[niko-data="user-name"]', '.user-name', '#user-name'],
                email: ['[data-user="email"]', '[niko-data="user-email"]', '.user-email', '#user-email'],
                role: ['[data-user="role"]', '[niko-data="user-role"]', '.user-role', '#user-role']
            };

            userSelectors.name.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.textContent = userName);
            });

            userSelectors.email.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.textContent = user.email);
            });

            userSelectors.role.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.textContent = userRole);
            });

            console.log('User info displayed');
        }

        isProtectedPage() {
            if (typeof window === 'undefined') return false;

            const protectedPaths = [
                '/app/customer/',
                '/app/retailer/',
                '/dashboard',
                '/profile'
            ];

            return protectedPaths.some(path => window.location.pathname.includes(path));
        }
    }

    // Initialize and expose globally
    window.NikoAuthCore = new NikoAuthCore();
    
    // Legacy logout function
    window.nikologout = async function() {
        if (window.NikoAuthCore) {
            await window.NikoAuthCore.logout();
            window.location.href = CONFIG.ROUTES.LOGIN_PAGE;
        }
    };

})(window);
