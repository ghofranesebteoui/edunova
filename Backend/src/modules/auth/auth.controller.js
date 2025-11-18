const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../user/user.schema");
const sendEmail = require("../../utils/email");
const { OAuth2Client } = require("google-auth-library");
const { pool } = require("../../config/db");
const {
  generateToken,
  generateVerificationToken,
} = require("../../utils/generateToken");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// ----------------- INSCRIPTION -----------------
const register = async (req, res) => {
  try {
    console.log("📝 Tentative d'inscription:", req.body.email);

    const { email, password, first_name, last_name, role } = req.body;

    // Validation des champs
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: "Tous les champs sont requis",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log("❌ Email déjà existant:", email);
      return res.status(400).json({
        success: false,
        error: "Un utilisateur avec cet email existe déjà",
      });
    }

    const user = await User.create({
      email,
      password,
      first_name,
      last_name,
      role: role || "etudiant",
    });

    console.log("✅ Utilisateur créé:", user.id);

    const verificationToken = generateVerificationToken();
    await user.saveVerificationToken(verificationToken);

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Vérifiez votre adresse email - EduNova",
      html: `<div>
              <h2>Bienvenue sur EduNova !</h2>
              <p>Bonjour ${user.first_name}, cliquez <a href="${verificationUrl}">ici</a> pour vérifier votre email.</p>
            </div>`,
    });

    console.log("📧 Email de vérification envoyé à:", user.email);

    res.status(201).json({
      success: true,
      message: "Inscription réussie ! Email envoyé.",
      data: { user: user.toJSON() },
    });
  } catch (error) {
    console.error("❌ Erreur inscription:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'inscription",
    });
  }
};

// ----------------- VERIFICATION EMAIL -----------------
const verifyEmail = async (req, res) => {
  try {
    console.log("🔍 Vérification email avec token:", req.params.token);

    const { token } = req.params;
    const user = await User.findByVerificationToken(token);

    if (!user) {
      console.log("❌ Token invalide ou expiré");
      return res.status(400).json({
        success: false,
        error: "Token invalide ou expiré",
      });
    }

    await user.verify();
    await user.clearVerificationToken();

    console.log("✅ Email vérifié pour:", user.email);

    res.status(200).json({
      success: true,
      message: "Email vérifié avec succès !",
    });
  } catch (error) {
    console.error("❌ Erreur vérification email:", error);
    res.status(500).json({
      success: false,
      error: "Erreur vérification email",
    });
  }
};

// ----------------- RENVOI EMAIL VERIFICATION -----------------
const resendVerificationEmail = async (req, res) => {
  try {
    console.log("📧 Renvoi email de vérification pour:", req.body.email);

    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: "Email déjà vérifié",
      });
    }

    const verificationToken = generateVerificationToken();
    await user.saveVerificationToken(verificationToken);

    const verificationUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Vérifiez votre adresse email - EduNova",
      html: `<div>
              <p>Bonjour ${user.first_name}, cliquez <a href="${verificationUrl}">ici</a> pour vérifier votre email.</p>
            </div>`,
    });

    console.log("✅ Email de vérification renvoyé");

    res.status(200).json({
      success: true,
      message: "Email de vérification renvoyé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur renvoi email:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi de l'email",
    });
  }
};

// ----------------- CONNEXION -----------------
const login = async (req, res) => {
  try {
    console.log("🔐 Tentative de connexion:", req.body.email);

    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email et mot de passe requis",
      });
    }

    const user = await User.findByEmail(email);

    if (!user) {
      console.log("❌ Utilisateur non trouvé:", email);
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      });
    }

    console.log("👤 Utilisateur trouvé:", {
      id: user.id,
      email: user.email,
      is_verified: user.is_verified,
      role: user.role,
    });

    if (!user.is_verified) {
      console.log("⚠️ Email non vérifié");
      return res.status(403).json({
        success: false,
        error: "Veuillez vérifier votre email avant de vous connecter",
        needsVerification: true,
      });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    console.log("🔑 Vérification mot de passe:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      });
    }

    const token = generateToken(user.id);
    await user.updateLastLogin();

    console.log("✅ Connexion réussie pour:", user.email);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("❌ Erreur connexion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la connexion",
    });
  }
};

// ----------------- LOGIN GOOGLE -----------------
const googleLogin = async (req, res) => {
  try {
    console.log("🔵 Tentative connexion Google:", req.body);

    const { email, first_name, last_name, uid } = req.body;

    if (!email || !uid) {
      console.log("❌ Données Google manquantes");
      return res.status(400).json({
        success: false,
        error: "Données Google manquantes (email ou uid)",
      });
    }

    // Chercher l'utilisateur
    let user = await User.findByEmail(email);

    if (!user) {
      // Créer un nouvel utilisateur Google
      console.log("🆕 Création nouvel utilisateur Google:", email);

      user = await User.create({
        email,
        first_name: first_name || "Utilisateur",
        last_name: last_name || "Google",
        password: "google_" + uid, // Mot de passe unique basé sur UID Firebase
        role: "etudiant",
      });

      // Vérifier automatiquement l'email pour les comptes Google
      await user.verify();
      console.log("✅ Utilisateur Google créé et vérifié:", user.id);
    } else {
      console.log("✅ Utilisateur Google existant trouvé:", user.id);

      // Si l'utilisateur existe mais n'est pas vérifié, le vérifier automatiquement
      if (!user.is_verified) {
        await user.verify();
        console.log("✅ Email vérifié automatiquement pour compte Google");
      }
    }

    // Générer le token JWT
    const token = generateToken(user.id);
    await user.updateLastLogin();

    console.log("✅ Connexion Google réussie, token généré");

    res.status(200).json({
      success: true,
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error("❌ Erreur Google login:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la connexion Google",
    });
  }
};

// ----------------- RESET PASSWORD -----------------
const resetPassword = async (req, res) => {
  try {
    console.log("🔄 Demande réinitialisation mot de passe:", req.body.email);

    const { email } = req.body;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Aucun compte avec cet email",
      });
    }

    const token = jwt.sign({ userId: user.id, email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    await user.saveResetToken(token);

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password/${token}`;

    await sendEmail({
      email: user.email,
      subject: "Réinitialisation de mot de passe - EduNova",
      html: `<div>
              <p>Bonjour ${user.first_name}, cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.</p>
            </div>`,
    });

    console.log("✅ Email de réinitialisation envoyé");

    res.status(200).json({
      success: true,
      message: "Email de réinitialisation envoyé",
    });
  } catch (error) {
    console.error("❌ Erreur reset password:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la réinitialisation",
    });
  }
};

const resetPasswordWithToken = async (req, res) => {
  try {
    console.log("🔑 Réinitialisation avec token");

    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.query(
      "SELECT * FROM users WHERE id = ? AND reset_password_token = ? AND reset_password_expires > ?",
      [decoded.userId, token, new Date()]
    );

    const user = users[0];
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Token invalide ou expiré",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    console.log("✅ Mot de passe réinitialisé pour:", user.email);

    res.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur reset password with token:", error);
    res.status(500).json({
      success: false,
      error: "Erreur interne du serveur lors de la réinitialisation",
    });
  }
};

// ----------------- LOGOUT -----------------
const logout = async (req, res) => {
  try {
    console.log("👋 Déconnexion utilisateur");
    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("❌ Erreur logout:", error);
    res.status(500).json({
      success: false,
      error: "Erreur déconnexion",
    });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  logout,
  resetPassword,
  resetPasswordWithToken,
  verifyEmail,
  resendVerificationEmail,
};
