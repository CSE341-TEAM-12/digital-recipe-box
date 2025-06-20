const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require("connect-mongo");
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const routes = require("./routes")
const db = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to MongoDB
db.connectDB();

// Configure Passport
require('./config/passport')(passport);

// Trust Render's Proxy
app.set('trust proxy', 1);

// Session Configuration
app.use(session({
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI}),
  secret: process.env.SESSION_SECRET || 'digital-recipe-box-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Google OAuth Configuration:`);
  console.log(`- Client ID: ${process.env.GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET'}`);
  console.log(`- Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'NOT SET'}`);
  console.log(`- Callback URL: ${process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'}`);
  console.log(`- Session Secret: ${process.env.SESSION_SECRET ? 'Set' : 'Using default (change in production)'}`);
});
