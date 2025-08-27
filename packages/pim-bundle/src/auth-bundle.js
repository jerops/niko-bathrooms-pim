// Copy auth code from auth package to create bundle
const fs = require('fs');
const path = require('path');

// Read the auth source
const authSource = fs.readFileSync(path.join(__dirname, '../../auth/src/niko-auth-core.js'), 'utf8');

// Export for webpack bundling
module.exports = authSource;