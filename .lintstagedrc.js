module.exports = {
  '*.{js,ts,md,json,yml}': 'prettier --write',
  '*.{js,ts}': 'eslint --cache --fix',
};
