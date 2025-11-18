const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Token JWT pour login
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Token de vérification email
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateToken,
  generateVerificationToken
};
