import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

const ResetPassword = () => {
  const { token } = useParams();
  console.log('Token récupéré depuis l’URL :', token);
 // Récupérer le token depuis l'URL
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!newPassword || newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { newPassword });
      setMessage('Mot de passe réinitialisé avec succès !');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Reset Password Error:', err);
      setError(err.response?.data?.error || 'Token invalide ou expiré');
    } finally {
      setLoading(false);
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
            <h2>Nouveau mot de passe</h2>
            
            {message && (
              <p style={{ 
                color: '#10b981', 
                textAlign: 'center', 
                backgroundColor: '#d1fae5',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px'
              }}>
                {message}
              </p>
            )}
            
            {error && (
              <p className="error-msg" style={{
                backgroundColor: '#fee2e2',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px'
              }}>
                {error}
              </p>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Entrez le nouveau mot de passe"
                    required
                    disabled={loading}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '18px'
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Minimum 6 caractères
                </small>
              </div>

              <div className="input-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le mot de passe"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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

export default ResetPassword;