const path = require('path');

// Common loader configuration
const getLoaderConfig = (tsConfigFile) => ({
  test: /\.ts$/,
  include: path.resolve(__dirname, 'src'),
  use: [
    {
      loader: 'ts-loader',
      options: {
        configFile: path.resolve(__dirname, tsConfigFile),
      },
    },
    {
      loader: path.resolve(
        __dirname,
        'scripts/webpackLoaderSymbolHasinstance.js'
      ),
    },
  ],
});

// Common configuration
const baseConfig = {
  mode: 'production',
  entry: './src/index.ts',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: { '.js': ['.ts', '.js'] },
  },
  module: {
    rules: [{ test: /\.js$/, loader: 'source-map-loader' }],
    noParse: [/[\\/]tweetnacl[\\/]/, /[\\/]tweetnacl-auth[\\/]/],
  },
};

// Browser build (UMD bundle)
const browserConfig = {
  ...baseConfig,
  name: 'browser',
  output: {
    filename: 'algosdk.min.js',
    path: path.resolve(__dirname, 'dist/browser'),
    library: {
      type: 'umd',
      name: 'algosdk',
    },
  },
  module: {
    ...baseConfig.module,
    rules: [
      getLoaderConfig('tsconfig-browser.json'),
      ...baseConfig.module.rules,
    ],
  },
};

// ESM build
const esmConfig = {
  ...baseConfig,
  name: 'esm',
  experiments: {
    outputModule: true,
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/esm'),
    library: {
      type: 'module',
    },
  },
  module: {
    ...baseConfig.module,
    rules: [getLoaderConfig('tsconfig-esm.json'), ...baseConfig.module.rules],
  },
};

// CJS build
const cjsConfig = {
  ...baseConfig,
  name: 'cjs',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/cjs'),
    library: {
      type: 'commonjs2',
    },
  },
  module: {
    ...baseConfig.module,
    rules: [getLoaderConfig('tsconfig-cjs.json'), ...baseConfig.module.rules],
  },
};

module.exports = [browserConfig, esmConfig, cjsConfig];
