const path = require('path');
const webpack = require('webpack');

module.exports = [
    {
        entry: './src/auth-bundle.js',
        output: {
            filename: 'niko-pim-auth.min.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
                'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk')
            })
        ],
        mode: 'production'
    },
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
        mode: 'production'
    }
];
