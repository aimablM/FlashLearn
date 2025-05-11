// utils/generateToken.js
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for authentication
 * @param {String} userId - User ID to encode in the token
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

module.exports = generateToken;