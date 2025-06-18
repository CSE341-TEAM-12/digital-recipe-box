module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  // Force exit to prevent hanging
  forceExit: true,
  // Clear mocks after each test
  clearMocks: true,
  // Add environment variables for MongoDB Memory Server
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  // Set environment variables for tests
  setupFiles: ['<rootDir>/jest.env.js'],
  // Global setup/teardown for CI
  globalSetup: undefined,
  globalTeardown: undefined,
  // Prevent Jest from caching between test runs
  cache: false
}; 