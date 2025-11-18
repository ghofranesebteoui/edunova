const {
  login,
  register,
  googleLogin,
  logout,
  resetPassword,
  resetPasswordWithToken,
  verifyEmail,
  resendVerificationEmail
} = require('../auth/auth.controller');

const authMiddleware = require('../../middlewares/authmiddleware');
const router = require('express').Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin); // pas besoin de middleware
router.post('/logout', authMiddleware, logout);

// Réinitialisation mot de passe
router.post('/forgot-password', resetPassword);
router.post('/reset-password/:token', resetPasswordWithToken);

// Vérification d'email
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
