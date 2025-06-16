// Authentication middleware
// For now, this is a placeholder until OAuth is fully implemented
// In a real implementation, you would verify JWT tokens or session cookies

const authenticateUser = (req, res, next) => {
  // For development purposes, we'll simulate an authenticated user
  // In production, you would verify the token from the Authorization header
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. No token provided.' 
    });
  }
  
  // In a real implementation, you would decode and verify the JWT token
  // For now, we'll simulate a user ID
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (token === 'test-token') {
    // Simulated user for testing
    req.user = {
      id: '507f1f77bcf86cd799439011', // Mock ObjectId
      displayName: 'Test User',
      email: 'test@example.com'
    };
    next();
  } else {
    return res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

module.exports = {
  authenticateUser
}; 