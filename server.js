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

// Dynamic Swagger Documentation
let swaggerDocument = require('./swagger/swagger.json');

// Middleware to dynamically set Swagger host
app.use('/api-docs', (req, res, next) => {
  // Create a copy of the swagger document to avoid modifying the original
  const dynamicSwaggerDoc = { ...swaggerDocument };
  
  // Set the host dynamically based on the request
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'http';
  const host = req.get('host');
  
  // Remove port for standard ports in production
  const cleanHost = process.env.NODE_ENV === 'production' && 
    ((protocol === 'https' && host.endsWith(':443')) || 
     (protocol === 'http' && host.endsWith(':80'))) 
    ? host.replace(/:(80|443)$/, '') 
    : host;
  
  dynamicSwaggerDoc.host = cleanHost;
  dynamicSwaggerDoc.schemes = protocol === 'https' ? ['https', 'http'] : ['http', 'https'];
  
  console.log(`Swagger configured for: ${protocol}://${cleanHost}`);
  
  // Store the dynamic document for swagger-ui-express
  req.swaggerDoc = dynamicSwaggerDoc;
  next();
}, swaggerUi.serve, (req, res, next) => {
  // Use the dynamic swagger document
  swaggerUi.setup(req.swaggerDoc)(req, res, next);
});

// Routes 
app.use("/", routes)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
