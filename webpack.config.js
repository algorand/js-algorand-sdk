import path from 'path';
import url from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const webpackConfig = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'algosdk.min.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: {
      type: 'umd',
      name: 'algosdk',
    },
  },
  devtool: 'source-map',
  resolve: {
    // Add '.ts' as resolvable extensions
    extensions: ['.ts', '.js'],
    extensionAlias: { '.js': ['.ts', '.js'] },
  },
  module: {
    rules: [
      // All files with a '.ts' extension will be handled by 'ts-loader'.
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, 'tsconfig-browser.json'),
        },
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
    // Don't parse tweetnacl module — https://github.com/dchest/tweetnacl-js/wiki/Using-with-Webpack
    noParse: [/[\\/]tweetnacl[\\/]/, /[\\/]tweetnacl-auth[\\/]/],
  },
};

export default webpackConfig;
