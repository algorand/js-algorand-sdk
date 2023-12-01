module.exports = {
  '*.{js,ts,md,json,yml}': 'biome format --write',
  '*.{js,ts}': 'biome lint --apply-unsafe',
};
