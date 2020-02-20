/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      packageJson: 'package.json',
      tsConfig: 'tsconfig.test.json',
    },
  },
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  transform: {
    '.(js|jsx)': '@sucrase/jest-plugin',
  },
  testPathIgnorePatterns: ['/node_modules/', '/playground/'],
}
