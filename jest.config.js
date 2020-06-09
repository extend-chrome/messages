/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      packageJson: 'package.json',
      tsConfig: 'tsconfig.json',
    },
  },
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/playground/'],
}
