// Set environment variables for Jest tests
process.env.NODE_ENV = 'test';
process.env.CI = 'true';

// Increase timeout for MongoDB operations
process.env.MONGO_TIMEOUT = '30000';

// Disable MongoDB Memory Server instance manager for CI
process.env.MONGOMS_DISABLE_POSTINSTALL = 'true'; 