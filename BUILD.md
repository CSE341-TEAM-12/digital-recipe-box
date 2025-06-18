# Build Documentation

This document describes the build scripts available in the Digital Recipe Box project.

## 📋 Available Build Scripts

### Core Build Scripts

#### `npm run build`
**Main build script** - Runs a clean build with documentation generation and CI testing.
- Cleans cache directories and temporary files
- Generates Swagger documentation 
- Runs all tests in CI mode with coverage
- Includes pre/post build messages for tracking

#### `npm run build:full`
**Comprehensive build** - Extended build with additional verification steps.
- Everything from main build script
- Generates full test coverage report
- Runs verification checks
- Recommended for production deployments

#### `npm run ci`
**Continuous Integration** - Designed for CI/CD pipelines.
- Performs clean install of dependencies (`npm ci`)
- Runs the main build process
- Optimized for automated environments

### Testing Scripts

#### `npm run test`
Standard test runner - Runs all tests with watch mode support.

#### `npm run test:ci`
CI-optimized testing - Runs tests without watch mode, with coverage reporting.
- Uses `--ci` flag for deterministic behavior
- Generates coverage reports
- Force exits to prevent hanging

#### `npm run test:coverage`
Generates detailed code coverage reports.

#### `npm run test:watch`
Runs tests in watch mode for development.

### Utility Scripts

#### `npm run clean`
Cleans build artifacts and cache:
- Removes `coverage/` directory
- Clears `node_modules/.cache/`
- Clears MongoDB memory server cache
- Safe to run (uses `|| true` to prevent failures)

#### `npm run docs`
Generates Swagger API documentation.

#### `npm run validate`
**Deployment readiness check** - Validates that the project is ready for deployment.
- Runs all tests
- Confirms build stability
- Shows success message when ready

#### `npm run health-check`
Simple health check to verify build completion.

### Development Scripts

#### `npm run dev`
Starts development server with auto-reload using nodemon.

#### `npm start`
Starts production server.

#### `npm run start:dev`
Starts development server on port 3000.

#### `npm run start:prod`
Starts production server with production environment.

## 🚀 Usage Examples

### For Development
```bash
# Start development with auto-reload
npm run dev

# Run tests while developing
npm run test:watch
```

### For Testing
```bash
# Run all tests
npm test

# Check deployment readiness
npm run validate

# Generate coverage report
npm run test:coverage
```

### For Production/Deployment
```bash
# Complete build for production
npm run build:full

# Quick build check
npm run build

# CI/CD pipeline
npm run ci
```

### For Maintenance
```bash
# Clean all build artifacts
npm run clean

# Regenerate documentation
npm run docs

# Health check
npm run health-check
```

## 🔧 Build Process Details

The build process includes:
1. **Cleaning** - Removes old build artifacts and caches
2. **Documentation** - Generates up-to-date Swagger API docs
3. **Testing** - Runs comprehensive test suite with coverage
4. **Verification** - Confirms all systems are working correctly

## ⚠️ Notes

- All build scripts include MongoDB Memory Server cache cleaning to prevent lock file issues
- Jest is configured for CI environments with `forceExit: true`
- Build scripts use parallel processing where possible for speed
- Pre/post build hooks provide clear feedback during the build process

## 🐛 Troubleshooting

If you encounter issues:

1. **MongoDB lock file errors**: Run `npm run clean` first - The build system now automatically handles this
2. **Jest hanging**: The `forceExit` option should prevent this
3. **Cache issues**: Clear caches with `npm run clean`
4. **Test failures**: Run `npm run validate` to check deployment readiness

## 🔧 Recent Fixes Applied

- **MongoDB Memory Server Issues**: Implemented robust retry logic and automatic cache cleanup
- **CI Environment Support**: Added proper CI detection and environment variable handling
- **Lock File Resolution**: Automatic cleanup of MongoDB binary locks that could cause test failures
- **Timeout Handling**: Increased timeouts for MongoDB operations in test environments
- **Process Management**: Better cleanup of MongoDB processes after test completion 