module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  globals: {
    chrome: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': [
      'warn',
      {
        arrays: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
        imports: 'always-multiline',
        objects: 'always-multiline',
      },
    ],
    'no-console': 'off',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        ignoreRestSiblings: true,
        vars: 'all',
      },
    ],
    quotes: ['warn', 'single'],
    semi: ['warn', 'never'],
  },
}
