const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const routes = require("./routes")
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
db.connectDB();

// CORS Configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Define allowed origins - you can configure these via environment variables
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      // Production domains (update these with your actual domains)
      'https://digital-recipe-box.onrender.com',
      'https://your-frontend-domain.com',
      'https://your-frontend-domain.netlify.app',
      'https://your-frontend-domain.vercel.app',
      // Add environment-based origins
      ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    ];
    
    // In development, allow all localhost and 127.0.0.1 origins
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
    const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
    
    if (allowedOrigins.includes(origin) || (isDevelopment && isLocalhost)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger Documentation with Relative Paths
let swaggerDocument = require('./swagger/swagger.json');

// Create swagger options for relative paths
const swaggerOptions = {
  swaggerOptions: {
    // Ensure relative paths work in all environments
    url: './swagger.json', // Relative URL to the swagger JSON
    dom_id: '#swagger-ui',
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    defaultModelRendering: 'example',
    displayRequestDuration: false,
    docExpansion: 'none',
    filter: false,
    layout: 'StandaloneLayout',
    maxDisplayedTags: null,
    operationsSorter: null,
    showExtensions: false,
    tagsSorter: null,
    tryItOutEnabled: true,
    validatorUrl: null,
    withCredentials: false
  },
  customCss: '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }'
};

// Middleware to serve Swagger with relative paths
app.use('/api-docs', (req, res, next) => {
  // Create a clean swagger document without host
  const cleanSwaggerDoc = { ...swaggerDocument };
  
  // Remove host completely for relative paths
  delete cleanSwaggerDoc.host;
  
  // Ensure schemes are set correctly
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  cleanSwaggerDoc.schemes = protocol === 'https' ? ['https', 'http'] : ['http', 'https'];
  
  // Log configuration
  console.log(`Swagger UI configured for relative paths (${protocol}://${req.get('host')})`);
  
  // Store the clean document
  req.swaggerDoc = cleanSwaggerDoc;
  next();
});

// Serve swagger JSON at a separate endpoint for reference
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(req.swaggerDoc || swaggerDocument);
});

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  swaggerUi.setup(req.swaggerDoc, swaggerOptions)(req, res, next);
});

// Routes 
app.use("/", routes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
