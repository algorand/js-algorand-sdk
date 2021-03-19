const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, 'test.js'),
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'build'),
  },
  devtool: 'source-map',
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
