module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    chrome: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'off',
    quotes: 'off',
    semi: 'off',
    '@typescript-eslint/restrict-plus-operands': 'error',
  },
}
