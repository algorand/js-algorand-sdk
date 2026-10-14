module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow sentence case commit messages
    'subject-case': [1, 'always', ['pascal-case', 'upper-case']],
    'type-empty': [1, 'never'],
    'subject-empty': [1, 'always'],
    'body-leading-blank': [0, 'always'],
    'body-max-line-length': [1, 'always', 200],
    'header-max-length': [1, 'always', 150],
    'footer-max-length': [1, 'always', 150],
    'footer-max-line-length': [1, 'always', 150],
  },
};
