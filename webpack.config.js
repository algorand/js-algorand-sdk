const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: './index.ts',
  output: {
    filename: 'algosdk.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'window',
      name: 'algosdk',
    },
  },
  devtool: 'source-map',
  resolve: {
    // Add '.ts' as resolvable extensions
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  module: {
    rules: [
      // All files with a '.ts' extension will be handled by 'ts-loader'.
      { test: /\.ts$/, loader: 'ts-loader' },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
};
