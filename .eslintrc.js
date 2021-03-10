module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },
  ignorePatterns: ['dist/'],
};
