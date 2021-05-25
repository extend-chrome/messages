/* eslint-env node */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./tests/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/playground/'],
}
