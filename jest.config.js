/* eslint-env node */

module.exports = {
  setupFilesAfterEnv: ['./tests/jest.setup.js'],
  transform: {
    '.(js|jsx|ts|tsx)': '@sucrase/jest-plugin',
  },
}
