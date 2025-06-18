const fs = require('fs');
const path = require('path');

function fixSwaggerTags() {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  
  if (!fs.existsSync(swaggerPath)) {
    console.error('❌ swagger.json not found');
    return;
  }

  const swaggerData = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
  
  // Define route-to-tag mappings
  const routeTagMappings = {
    // General endpoints
    '/': 'General',
    
    // Authentication endpoints
    '/auth/google': 'Authentication',
    '/auth/google/callback': 'Authentication',
    '/auth/login/success': 'Authentication',
    '/auth/login/failed': 'Authentication',
    '/auth/logout': 'Authentication',
    '/auth/status': 'Authentication',
    
    // User endpoints
    '/users/me': 'Users',
    '/users/{id}/recipes': 'Users',
    '/users/{id}': 'Users',
    
    // Recipe endpoints
    '/recipes/': 'Recipes',
    '/recipes/user': 'Recipes',
    '/recipes/{id}': 'Recipes',
    
    // Cookbook endpoints
    '/cookbooks/': 'Cookbooks',
    '/cookbooks/{id}': 'Cookbooks',
    
    // Review endpoints
    '/reviews/recipe/{recipeId}': 'Reviews',
    '/reviews/user': 'Reviews',
    '/reviews/{id}': 'Reviews'
  };

  // Clean up and fix paths
  const cleanPaths = {};
  const processedPaths = new Set();
  
  // Define duplicate paths to remove (keep the full paths, remove shortened ones)
  const duplicatesToRemove = new Set([
    '/google',              // Keep /auth/google
    '/google/callback',     // Keep /auth/google/callback
    '/login/success',       // Keep /auth/login/success
    '/login/failed',        // Keep /auth/login/failed
    '/logout',              // Keep /auth/logout
    '/status',              // Keep /auth/status
    '/me',                  // Keep /users/me
    '/{id}/recipes',        // Keep /users/{id}/recipes
    '/{id}',                // Keep /users/{id}
    '/user',                // Keep /recipes/user
    '/recipe/{recipeId}'    // Keep /reviews/recipe/{recipeId}
  ]);

  for (const [path, pathData] of Object.entries(swaggerData.paths)) {
    // Skip paths that are duplicates we want to remove
    if (duplicatesToRemove.has(path)) {
      console.log(`🗑️ Removing duplicate path: ${path}`);
      continue;
    }
    
    // Skip duplicate paths (this handles the bloated authentication issue)
    const normalizedPath = path.replace(/\/$/, '') || '/';
    
    if (processedPaths.has(normalizedPath)) {
      console.log(`⚠️ Skipping duplicate path: ${path}`);
      continue;
    }
    
    processedPaths.add(normalizedPath);
    
    // Determine the appropriate tag for this path
    let tag = 'default';
    
    // More sophisticated path matching with priority order
    if (path === '/') {
      tag = 'General';
    } else if (path.includes('/auth/')) {
      tag = 'Authentication';
    } else if (path.includes('/users/')) {
      tag = 'Users';
    } else if (path.includes('/recipes') || path.includes('/recipe/')) {
      tag = 'Recipes';
    } else if (path.includes('/cookbooks')) {
      tag = 'Cookbooks';
    } else if (path.includes('/reviews')) {
      tag = 'Reviews';
    }
    
    // If still default, do NOT set it to General, leave as 'default' for now
    // The fix will be applied later by overriding the tag in the method loop
    
    // Process each HTTP method for this path
    const cleanPathData = {};
    for (const [method, methodData] of Object.entries(pathData)) {
      // Special handling for root path - skip POST method (phantom endpoint)
      if (normalizedPath === '/' && method === 'post') {
        console.log('🗑️ Removing phantom POST method from root endpoint');
        continue;
      }
      
      // Determine the correct tag for this specific path/method combination
      let finalTag = tag;
      
      // Override default tag with specific path matching
      if (finalTag === 'default') {
        if (normalizedPath === '/recipes') {
          finalTag = 'Recipes';
        } else if (normalizedPath === '/cookbooks') {
          finalTag = 'Cookbooks';
        } else {
          finalTag = 'General';
        }
      }
      
      cleanPathData[method] = {
        ...methodData,
        tags: [finalTag]
      };
      
      // Add summary and description if missing
      if (!methodData.summary && !methodData.description) {
        const pathDesc = getPathDescription(normalizedPath, method);
        cleanPathData[method].summary = pathDesc.summary;
        cleanPathData[method].description = pathDesc.description;
      }
    }
    
    cleanPaths[normalizedPath] = cleanPathData;
  }

  // Update the swagger data
  swaggerData.paths = cleanPaths;

  // Write back the cleaned swagger file
  fs.writeFileSync(swaggerPath, JSON.stringify(swaggerData, null, 2));
  console.log('✅ Swagger tags fixed and duplicates removed');
  console.log(`📊 Processed ${Object.keys(cleanPaths).length} unique paths`);
}

function getPathDescription(path, method) {
  const descriptions = {
    '/': {
      get: { summary: 'API Welcome Message', description: 'Returns a welcome message for the Digital Recipe Box API' }
    },
    '/auth/google': {
      get: { summary: 'Initiate Google OAuth login', description: 'Redirects user to Google OAuth consent screen' }
    },

    '/auth/google/callback': {
      get: { summary: 'Google OAuth callback', description: 'Handles the callback from Google OAuth' }
    },

    '/auth/login/success': {
      get: { summary: 'Authentication success', description: 'Endpoint hit after successful Google OAuth authentication' }
    },

    '/auth/login/failed': {
      get: { summary: 'Authentication failure', description: 'Endpoint hit after failed Google OAuth authentication' }
    },

    '/auth/logout': {
      get: { summary: 'Logout user', description: 'Logs out the currently authenticated user' }
    },

    '/auth/status': {
      get: { summary: 'Check authentication status', description: 'Check if the current user is authenticated' }
    },

    '/users/me': {
      get: { summary: 'Get current user profile', description: 'Get the profile information of the currently authenticated user' }
    },

    '/users/{id}/recipes': {
      get: { summary: 'Get user recipes', description: 'Get all public recipes created by a specific user' }
    },

    '/users/{id}': {
      put: { summary: 'Update user profile', description: 'Update the profile information of a specific user' },
      delete: { summary: 'Delete user account', description: 'Permanently delete a user account' }
    },

    '/recipes/': {
      get: { summary: 'Get all public recipes', description: 'Retrieve a list of all public recipes' },
      post: { summary: 'Create a new recipe', description: 'Create a new recipe with ingredients and instructions' }
    },
    '/recipes': {
      get: { summary: 'Get all public recipes', description: 'Retrieve a list of all public recipes' },
      post: { summary: 'Create a new recipe', description: 'Create a new recipe with ingredients and instructions' }
    },
    '/recipes/user': {
      get: { summary: 'Get user recipes', description: 'Get all recipes owned by the authenticated user' }
    },

    '/recipes/{id}': {
      get: { summary: 'Get recipe by ID', description: 'Get a specific recipe by its ID' },
      put: { summary: 'Update recipe', description: 'Update an existing recipe' },
      delete: { summary: 'Delete recipe', description: 'Delete a recipe and all its associated reviews' }
    },
    '/cookbooks/': {
      get: { summary: 'Get user cookbooks', description: 'Get all cookbooks owned by the authenticated user' },
      post: { summary: 'Create cookbook', description: 'Create a new cookbook to organize recipes' }
    },
    '/cookbooks': {
      get: { summary: 'Get user cookbooks', description: 'Get all cookbooks owned by the authenticated user' },
      post: { summary: 'Create cookbook', description: 'Create a new cookbook to organize recipes' }
    },
    '/cookbooks/{id}': {
      get: { summary: 'Get cookbook by ID', description: 'Get a specific cookbook by its ID' },
      put: { summary: 'Update cookbook', description: 'Update an existing cookbook' },
      delete: { summary: 'Delete cookbook', description: 'Delete a cookbook' }
    },
    '/reviews/recipe/{recipeId}': {
      get: { summary: 'Get recipe reviews', description: 'Get all reviews for a specific recipe' },
      post: { summary: 'Create recipe review', description: 'Create a new review for a recipe' }
    },
    '/reviews/user': {
      get: { summary: 'Get user reviews', description: 'Get all reviews created by the authenticated user' }
    },
    '/reviews/{id}': {
      get: { summary: 'Get review by ID', description: 'Get a specific review by its ID' },
      put: { summary: 'Update review', description: 'Update an existing review' },
      delete: { summary: 'Delete review', description: 'Delete a review' }
    }
  };

  const defaultDesc = descriptions[path]?.[method];
  if (defaultDesc) {
    return defaultDesc;
  }
  
  // Generate appropriate default descriptions based on path patterns
  if (path.includes('/auth/')) {
    return { 
      summary: `Authentication ${method.toUpperCase()}`, 
      description: `Authentication related ${method.toUpperCase()} operation` 
    };
  } else if (path.includes('/users/')) {
    return { 
      summary: `User ${method.toUpperCase()}`, 
      description: `User management ${method.toUpperCase()} operation` 
    };
  } else if (path.includes('/recipes') || path.includes('/recipe/')) {
    return { 
      summary: `Recipe ${method.toUpperCase()}`, 
      description: `Recipe management ${method.toUpperCase()} operation` 
    };
  } else if (path.includes('/cookbooks')) {
    return { 
      summary: `Cookbook ${method.toUpperCase()}`, 
      description: `Cookbook management ${method.toUpperCase()} operation` 
    };
  } else if (path.includes('/reviews')) {
    return { 
      summary: `Review ${method.toUpperCase()}`, 
      description: `Review management ${method.toUpperCase()} operation` 
    };
  }
  
  return { 
    summary: `${method.toUpperCase()} ${path}`, 
    description: `${method.toUpperCase()} operation for ${path}` 
  };
}

// Only run if called directly, not when required
if (require.main === module) {
  fixSwaggerTags();
}

module.exports = fixSwaggerTags; 