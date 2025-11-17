import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen } from 'react-icons/fa';
import './LoginPage.css'; // Reuse LoginPage.css for consistent styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message); // e.g., "Email de réinitialisation envoyé"
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      console.error('Forgot Password Error:', err);
      setError(err.response?.data?.error || 'Une erreur s’est produite');
    }
  };

  return (
    <div className="login-page-wrapper">
      <motion.div
        className="page-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="form-section"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="login-form">
            <div className="logo-header">
              <FaBookOpen className="book-icon" />
              <h1>EduNova</h1>
            </div>
            <h2>Réinitialiser le mot de passe</h2>

            {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
            {error && <p className="error-msg">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@xyz.com"
                  required
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="login-btn">
                Envoyer le lien
              </button>
            </form>

            <div className="switch-under-form">
              <p>Retour à la connexion</p>
              <button
                type="button"
                className="switch-btn under-form"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;