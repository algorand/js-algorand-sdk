const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'test.js'),
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'build'),
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /(\.(js|ts)?$)/,
        include: /src/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};
