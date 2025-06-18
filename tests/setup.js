const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');

let mongoServer;

// Force clean MongoDB binary cache on CI
const cleanMongoCache = () => {
  try {
    const cacheDir = path.join(os.homedir(), '.cache', 'mongodb-binaries');
    if (fs.existsSync(cacheDir)) {
      fs.rmSync(cacheDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore errors during cleanup
  }
};

beforeAll(async () => {
  // Clean cache if in CI environment
  if (process.env.CI || process.env.NODE_ENV === 'test') {
    cleanMongoCache();
  }

  try {
    // Start in-memory MongoDB instance with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        mongoServer = await MongoMemoryServer.create({
          instance: {
            port: undefined, // Let MongoDB Memory Server choose a random port
            dbName: 'test_db_' + Date.now(), // Unique database name
          },
          binary: {
            version: '7.0.14',
            downloadDir: path.join(os.tmpdir(), 'mongodb-binaries'),
            skipMD5: true,
          }
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        
        // Clean cache and wait before retry
        cleanMongoCache();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database with timeout
    await mongoose.connect(mongoUri, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
  } catch (error) {
    console.error('Failed to setup MongoDB Memory Server:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Cleanup: close connection and stop MongoDB instance
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop({ doCleanup: true });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
  
  // Final cleanup
  if (process.env.CI || process.env.NODE_ENV === 'test') {
    cleanMongoCache();
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock console methods to reduce test output noise
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn()
}; 