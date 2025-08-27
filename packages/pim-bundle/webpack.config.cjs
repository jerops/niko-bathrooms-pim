const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'niko-pim-auth': './src/auth-bundle.js',
    'niko-pim-full': './src/full-bundle.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    library: 'NikoPIM',
    libraryTarget: 'window',
    clean: true
  },
  resolve: {
    extensions: ['.js', '.ts']
  },
  optimization: {
    minimize: true
  }
};
