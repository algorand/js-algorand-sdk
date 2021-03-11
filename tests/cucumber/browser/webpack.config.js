const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'test.js'),
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'build'),
  },
  devtool: 'source-map',
};
