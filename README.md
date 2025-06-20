# Digital Recipe Box API

A comprehensive REST API for managing recipes, cookbooks, and reviews. Built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CSE341-TEAM-12/digital-recipe-box.git
   cd digital-recipe-box
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/digital-recipe-box
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

5. **Access the API**
   - **Base URL**: `http://localhost:3000`
   - **API Documentation**: `http://localhost:3000/api-docs/`

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🧪 API Testing Guide

### 1. General Endpoints

#### Welcome Message
```http
GET /
```

**Response:**
```json
"Welcome to Digital Recipe Box API"
```

**cURL Example:**
```bash
curl http://localhost:3000/
```

---

### 2. Recipe Endpoints

#### 2.1 Get All Public Recipes
```http
GET /recipes
```

**Description:** Retrieve all publicly available recipes

**Access:** Public

**Response Example:**
```json
{
  "message": "Public recipes retrieved successfully",
  "count": 2,
  "recipes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade cookies",
      "ingredients": [
        {
          "name": "flour",
          "quantity": "2 cups"
        },
        {
          "name": "chocolate chips",
          "quantity": "1 cup"
        }
      ],
      "instructions": [
        "Preheat oven to 375°F",
        "Mix dry ingredients",
        "Add chocolate chips",
        "Bake for 10-12 minutes"
      ],
      "prepTimeMinutes": 15,
      "cookTimeMinutes": 12,
      "servings": 24,
      "isPublic": true,
      "tags": ["dessert", "cookies"],
      "creatorId": {
        "_id": "507f1f77bcf86cd799439012",
        "displayName": "John Doe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/recipes
```

**Test Scenarios:**
- ✅ Should return all public recipes
- ✅ Should include creator information
- ✅ Should be sorted by creation date (newest first)

#### 2.2 Get Recipe by ID
```http
GET /recipes/:id
```

**Description:** Get a specific recipe by its ID

**Access:** Public for public recipes, Protected for private recipes

**Parameters:**
- `id` (path) - Recipe ObjectId

**Response Example:**
```json
{
  "message": "Recipe retrieved successfully",
  "recipe": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies",
    "ingredients": [
      {
        "name": "flour",
        "quantity": "2 cups"
      }
    ],
    "instructions": ["Step 1", "Step 2"],
    "prepTimeMinutes": 15,
    "cookTimeMinutes": 12,
    "servings": 24,
    "isPublic": true,
    "tags": ["dessert"],
    "creatorId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// Recipe not found
{
  "error": "Recipe not found"
}

// Access denied for private recipe
{
  "error": "Access denied. This recipe is private."
}
```

**cURL Examples:**
```bash
# Public recipe
curl -X GET http://localhost:3000/recipes/507f1f77bcf86cd799439011

# Private recipe (requires authentication)
curl -X GET http://localhost:3000/recipes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer your-jwt-token"
```

**Test Scenarios:**
- ✅ Should return recipe details for valid ID
- ❌ Should return 404 for non-existent recipe
- ❌ Should return 403 for private recipe without authentication
- ✅ Should allow creator to access their private recipes

#### 2.3 Create Recipe
```http
POST /recipes
```

**Description:** Create a new recipe

**Access:** Protected (Authentication required)

**Request Body:**
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "ingredients": [
    {
      "name": "flour",
      "quantity": "2 cups"
    },
    {
      "name": "chocolate chips",
      "quantity": "1 cup"
    }
  ],
  "instructions": [
    "Preheat oven to 375°F",
    "Mix dry ingredients",
    "Add chocolate chips",
    "Bake for 10-12 minutes"
  ],
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 12,
  "servings": 24,
  "isPublic": true,
  "tags": ["dessert", "cookies"]
}
```

**Response Example:**
```json
{
  "message": "Recipe created successfully",
  "recipe": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies",
    "ingredients": [
      {
        "name": "flour",
        "quantity": "2 cups"
      }
    ],
    "instructions": ["Step 1", "Step 2"],
    "prepTimeMinutes": 15,
    "cookTimeMinutes": 12,
    "servings": 24,
    "isPublic": true,
    "tags": ["dessert", "cookies"],
    "creatorId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies",
    "ingredients": [
      {
        "name": "flour",
        "quantity": "2 cups"
      },
      {
        "name": "chocolate chips",
        "quantity": "1 cup"
      }
    ],
    "instructions": [
      "Preheat oven to 375°F",
      "Mix dry ingredients",
      "Add chocolate chips",
      "Bake for 10-12 minutes"
    ],
    "prepTimeMinutes": 15,
    "cookTimeMinutes": 12,
    "servings": 24,
    "isPublic": true,
    "tags": ["dessert", "cookies"]
  }'
```

**Test Scenarios:**
- ✅ Should create recipe with valid data
- ❌ Should return 401 without authentication
- ❌ Should return 400 for missing required fields
- ✅ Should auto-assign creatorId from authenticated user

---

### 3. Cookbook Endpoints

#### 3.1 Get User Cookbooks
```http
GET /cookbooks
```

**Description:** Get all cookbooks owned by the authenticated user

**Access:** Protected

**Response Example:**
```json
{
  "message": "User cookbooks retrieved successfully",
  "count": 1,
  "cookbooks": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "My Dessert Collection",
      "description": "Sweet treats and desserts",
      "recipeIds": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Chocolate Chip Cookies",
          "description": "Classic cookies",
          "isPublic": true
        }
      ],
      "ownerId": {
        "_id": "507f1f77bcf86cd799439012",
        "displayName": "John Doe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/cookbooks \
  -H "Authorization: Bearer your-jwt-token"
```

#### 3.2 Get Cookbook by ID
```http
GET /cookbooks/:id
```

**Description:** Get a specific cookbook (must be owner)

**Access:** Protected

**Parameters:**
- `id` (path) - Cookbook ObjectId

**Response Example:**
```json
{
  "message": "Cookbook retrieved successfully",
  "cookbook": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Chocolate Chip Cookies",
        "description": "Classic cookies",
        "isPublic": true,
        "creatorId": "507f1f77bcf86cd799439012"
      }
    ],
    "ownerId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/cookbooks/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer your-jwt-token"
```

#### 3.3 Create Cookbook
```http
POST /cookbooks
```

**Description:** Create a new cookbook

**Access:** Protected

**Request Body:**
```json
{
  "name": "My Dessert Collection",
  "description": "Sweet treats and desserts",
  "recipeIds": ["507f1f77bcf86cd799439011"]
}
```

**Response Example:**
```json
{
  "message": "Cookbook created successfully",
  "cookbook": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Chocolate Chip Cookies",
        "description": "Classic cookies",
        "isPublic": true
      }
    ],
    "ownerId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/cookbooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": ["507f1f77bcf86cd799439011"]
  }'
```

---

### 3. Cookbook Endpoints

#### 3.1 Get User Cookbooks
```http
GET /cookbooks
```

**Description:** Get all cookbooks owned by the authenticated user

**Access:** Protected

**Response Example:**
```json
{
  "message": "User cookbooks retrieved successfully",
  "count": 2,
  "cookbooks": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "My Dessert Collection",
      "description": "Sweet treats and desserts",
      "recipeIds": [
        {
          "_id": "507f1f77bcf86cd799439011",
          "title": "Chocolate Chip Cookies",
          "description": "Classic cookies",
          "isPublic": true
        }
      ],
      "ownerId": {
        "_id": "507f1f77bcf86cd799439012",
        "displayName": "John Doe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/cookbooks \
  -H "Authorization: Bearer your-jwt-token"
```

#### 3.2 Get Cookbook by ID
```http
GET /cookbooks/:id
```

**Description:** Get a specific cookbook by its ID

**Access:** Public

**Parameters:**
- `id` (path) - Cookbook ObjectId

**Response Example:**
```json
{
  "message": "Cookbook retrieved successfully",
  "cookbook": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Chocolate Chip Cookies",
        "description": "Classic cookies",
        "isPublic": true
      }
    ],
    "ownerId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    }
  },
  "isOwner": false
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/cookbooks/507f1f77bcf86cd799439013
```

#### 3.3 Create Cookbook
```http
POST /cookbooks
```

**Description:** Create a new cookbook

**Access:** Protected

**Request Body:**
```json
{
  "name": "My Dessert Collection",
  "description": "Sweet treats and desserts",
  "recipeIds": ["507f1f77bcf86cd799439011"]
}
```

**Response Example:**
```json
{
  "message": "Cookbook created successfully",
  "cookbook": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Chocolate Chip Cookies",
        "description": "Classic cookies",
        "isPublic": true
      }
    ],
    "ownerId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/cookbooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "My Dessert Collection",
    "description": "Sweet treats and desserts",
    "recipeIds": ["507f1f77bcf86cd799439011"]
  }'
```

#### 3.4 Update Cookbook
```http
PUT /cookbooks/:id
```

**Description:** Update an existing cookbook

**Access:** Protected (Owner only)

**Parameters:**
- `id` (path) - Cookbook ObjectId

**Request Body:**
```json
{
  "name": "Updated Cookbook Name",
  "description": "Updated description",
  "recipeIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response Example:**
```json
{
  "message": "Cookbook updated successfully",
  "cookbook": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Updated Cookbook Name",
    "description": "Updated description",
    "recipeIds": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Chocolate Chip Cookies"
      }
    ],
    "ownerId": {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe"
    }
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/cookbooks/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Updated Cookbook Name",
    "description": "Updated description"
  }'
```

#### 3.5 Delete Cookbook
```http
DELETE /cookbooks/:id
```

**Description:** Delete a cookbook permanently

**Access:** Protected (Owner only)

**Parameters:**
- `id` (path) - Cookbook ObjectId

**Response Example:**
```json
{
  "message": "Cookbook deleted successfully"
}
```

**Error Responses:**
```json
// Access denied
{
  "error": "Access denied. You can only delete your own cookbooks."
}

// Cookbook not found
{
  "error": "Cookbook not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/cookbooks/507f1f77bcf86cd799439013 \
  -H "Authorization: Bearer your-jwt-token"
```

---

### 4. User Endpoints

#### 4.1 Get All Users
```http
GET /users
```

**Description:** Get a list of all users with basic profile information

**Access:** Public

**Response Example:**
```json
{
  "message": "Users retrieved successfully",
  "count": 10,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "displayName": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "profileImageUrl": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/users
```

#### 4.2 Get Current User Profile
```http
GET /users/me
```

**Description:** Get the profile information of the currently authenticated user

**Access:** Protected

**Response Example:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "oauthId": "123456789",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "profileImageUrl": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer your-jwt-token"
```

#### 4.3 Get User Recipes
```http
GET /users/:id/recipes
```

**Description:** Get all public recipes created by a specific user

**Access:** Public

**Parameters:**
- `id` (path) - User ObjectId

**Response Example:**
```json
{
  "message": "User recipes retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "displayName": "John Doe"
  },
  "count": 3,
  "recipes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Chocolate Chip Cookies",
      "description": "Classic cookies",
      "isPublic": true,
      "creatorId": {
        "_id": "507f1f77bcf86cd799439012",
        "displayName": "John Doe"
      }
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/users/507f1f77bcf86cd799439012/recipes
```

#### 4.4 Update User Profile
```http
PUT /users/:id
```

**Description:** Update the profile information of the authenticated user

**Access:** Protected (Self only)

**Parameters:**
- `id` (path) - User ObjectId (must match authenticated user)

**Request Body:**
```json
{
  "displayName": "John Updated",
  "firstName": "John",
  "lastName": "Updated",
  "email": "john.updated@example.com",
  "profileImageUrl": "https://example.com/new-avatar.jpg"
}
```

**Response Example:**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "displayName": "John Updated",
    "firstName": "John",
    "lastName": "Updated",
    "email": "john.updated@example.com",
    "profileImageUrl": "https://example.com/new-avatar.jpg"
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/users/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "displayName": "John Updated",
    "email": "john.updated@example.com"
  }'
```

#### 4.5 Delete User Account
```http
DELETE /users/:id
```

**Description:** Permanently delete a user account

**Access:** Protected (Self only)

**Parameters:**
- `id` (path) - User ObjectId (must match authenticated user)

**Response Example:**
```json
{
  "message": "User account deleted successfully"
}
```

**Error Responses:**
```json
// Access denied
{
  "error": "Access denied. You can only delete your own account."
}

// User not found
{
  "error": "User not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/users/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer your-jwt-token"
```

---

### 5. Review Endpoints

#### 5.1 Get Reviews for Recipe
```http
GET /reviews/recipe/:recipeId
```

**Description:** Get all reviews for a specific recipe

**Access:** Public (for public recipes)

**Parameters:**
- `recipeId` (path) - Recipe ObjectId

**Response Example:**
```json
{
  "message": "Reviews retrieved successfully",
  "recipeId": "507f1f77bcf86cd799439011",
  "count": 2,
  "averageRating": 4.5,
  "reviews": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "rating": 5,
      "comment": "Absolutely delicious! Perfect texture.",
      "reviewerId": {
        "_id": "507f1f77bcf86cd799439015",
        "displayName": "Jane Smith"
      },
      "recipeId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439016",
      "rating": 4,
      "comment": "Good recipe, but needed more chocolate chips.",
      "reviewerId": {
        "_id": "507f1f77bcf86cd799439017",
        "displayName": "Bob Johnson"
      },
      "recipeId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/reviews/recipe/507f1f77bcf86cd799439011
```

#### 4.2 Create Review
```http
POST /reviews/recipe/:recipeId
```

**Description:** Add a review to a recipe

**Access:** Protected

**Parameters:**
- `recipeId` (path) - Recipe ObjectId

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Absolutely delicious! Perfect texture."
}
```

**Response Example:**
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439014",
    "rating": 5,
    "comment": "Absolutely delicious! Perfect texture.",
    "reviewerId": {
      "_id": "507f1f77bcf86cd799439015",
      "displayName": "Jane Smith"
    },
    "recipeId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Chocolate Chip Cookies",
      "description": "Classic cookies"
    },
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**
```json
// Already reviewed
{
  "error": "You have already reviewed this recipe"
}

// Private recipe
{
  "error": "Cannot review a private recipe"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/reviews/recipe/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "rating": 5,
    "comment": "Absolutely delicious! Perfect texture."
  }'
```

**Test Scenarios:**
- ✅ Should create review for public recipe
- ❌ Should return 403 for private recipe
- ❌ Should return 409 if user already reviewed
- ❌ Should return 404 for non-existent recipe

---

## 🔧 Testing Tools

### 1. Swagger UI (Recommended)
Visit `http://localhost:3000/api-docs/` for interactive API testing

### 2. Postman Collection
Import this collection to test all endpoints:

```json
{
  "info": {
    "name": "Digital Recipe Box API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "authToken",
      "value": "your-jwt-token"
    }
  ]
}
```

### 3. cURL Testing Script
Create a test script with all endpoints:

```bash
#!/bin/bash
BASE_URL="http://localhost:3000"
TOKEN="your-jwt-token"

echo "Testing Digital Recipe Box API..."

# Test welcome endpoint
echo "1. Testing welcome endpoint..."
curl -s "$BASE_URL/"

# Test public recipes
echo -e "\n\n2. Testing public recipes..."
curl -s "$BASE_URL/recipes" | jq

# Test create recipe (requires auth)
echo -e "\n\n3. Testing create recipe..."
curl -X POST "$BASE_URL/recipes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Recipe","isPublic":true}' | jq
```

## 📊 Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Error message",
  "details": ["Specific validation errors"],
  "message": "Additional context"
}
```

## 🚦 CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:5000`
- Production domains (configurable via environment)

### Headers Supported
- `Content-Type`
- `Authorization`
- `Accept`
- `Origin`
- `X-Requested-With`

## 🔐 Authentication Notes

1. **JWT Token Required**: Most endpoints require a valid JWT token
2. **Token Format**: `Bearer <token>`
3. **Token Location**: Authorization header
4. **User Context**: The token provides user information for ownership checks

## 🧪 Test Data Examples

### Sample Recipe Data
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "ingredients": [
    {"name": "flour", "quantity": "2 cups"},
    {"name": "sugar", "quantity": "1 cup"},
    {"name": "chocolate chips", "quantity": "1 cup"}
  ],
  "instructions": [
    "Preheat oven to 375°F",
    "Mix dry ingredients",
    "Add chocolate chips",
    "Bake for 10-12 minutes"
  ],
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 12,
  "servings": 24,
  "isPublic": true,
  "tags": ["dessert", "cookies"]
}
```

### Sample Cookbook Data
```json
{
  "name": "My Dessert Collection",
  "description": "Sweet treats and desserts",
  "recipeIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

### Sample Review Data
```json
{
  "rating": 5,
  "comment": "Absolutely delicious! Perfect texture and flavor."
}
```

## 📝 Development Commands

```bash
# Start development server
npm run start:dev

# Start production server
npm run start:prod

# Generate/update API documentation
npm run docs

# Install dependencies
npm install
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request

## 📞 Support

For questions or issues:
- GitHub Issues: [Create an issue](https://github.com/CSE341-TEAM-12/digital-recipe-box/issues)
- Documentation: Visit `/api-docs` for interactive testing

---

**Happy Testing! 🧪✨**
