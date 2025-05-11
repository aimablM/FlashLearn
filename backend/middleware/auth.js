// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 * Protect routes - Verify JWT token and add user to request
 */
const protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by id and add to request (without password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Check if the user is the owner of the resource
 * @param {String} paramIdField - Name of the request parameter containing the resource owner ID
 * @param {String} userIdField - Field in the request parameter resource that contains the user ID
 */
const isOwner = (paramIdField, userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      // If no user in request (should never happen with protect middleware)
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      // Get resource ID from request parameters
      const resourceId = req.params[paramIdField];
      
      // If the parameter is the user's own ID (for user routes)
      if (paramIdField === 'id' && userIdField === 'id') {
        if (req.user.id !== resourceId) {
          return res.status(403).json({ message: 'Not authorized to access this resource' });
        }
        return next();
      }

      // For other resources, fetch from DB and check ownership
      const Model = req.baseUrl.includes('sets') ? 
        require('../models/FlashcardSet') : require('../models/Flashcard');
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      // Check if logged in user is the owner
      if (resource[userIdField].toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to access this resource' });
      }
      
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error checking ownership' });
    }
  };
};

module.exports = { protect, isOwner };