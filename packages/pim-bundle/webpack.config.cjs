const path = require('path');
const webpack = require('webpack');

module.exports = [
    // Login Bundle (standalone for cleaner Webflow integration)
    {
        entry: './src/login-bundle.js',
        output: {
            filename: 'niko-login-handler.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        mode: 'production',
        optimization: {
            minimize: true,
        }
    },
    // Critical Path Bundle (optimized for initial load)
    {
        entry: './src/critical-path-bundle.js',
        output: {
            filename: 'niko-pim-critical.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
                'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk'),
                'process.env.VERSION': JSON.stringify('5.1.0')
            })
        ],
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Core Auth Bundle (optimized for size)
    {
        entry: './src/auth-core-bundle.js',
        output: {
            filename: 'niko-pim-auth-core.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
                'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk')
            })
        ],
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Wishlist Core Bundle
    {
        entry: './src/wishlist-core-bundle.js',
        output: {
            filename: 'niko-pim-wishlist-core.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Notifications Core Bundle
    {
        entry: './src/notifications-core-bundle.js',
        output: {
            filename: 'niko-pim-notifications-core.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Advanced Auth Bundle (loaded on demand)
    {
        entry: './src/auth-advanced-bundle.js',
        output: {
            filename: 'niko-pim-auth-advanced.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
                'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk')
            })
        ],
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Wishlist Advanced Bundle (loaded on demand)
    {
        entry: './src/wishlist-advanced-bundle.js',
        output: {
            filename: 'niko-pim-wishlist-advanced.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Notifications Advanced Bundle (loaded on demand)
    {
        entry: './src/notifications-advanced-bundle.js',
        output: {
            filename: 'niko-pim-notifications-advanced.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    },
    // Full Bundle (backward compatibility)
    {
        entry: './src/full-bundle.js',
        output: {
            filename: 'niko-pim-full.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
                'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk')
            })
        ],
        mode: 'production',
        optimization: {
            usedExports: true,
            sideEffects: false,
        }
    }
];
