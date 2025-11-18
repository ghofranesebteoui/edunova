import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaBookOpen } from 'react-icons/fa';
import axios from 'axios';

const VerifyEmail = () => {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
      
      if (res.data.success) {
        setStatus('success');
        setMessage(res.data.message);
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Erreur lors de la vérification');
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const email = prompt('Veuillez entrer votre adresse email :');
      if (!email) {
        setResending(false);
        return;
      }

      const res = await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      
      if (res.data.success) {
        alert('Email de vérification renvoyé avec succès !');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '50px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ marginBottom: '30px' }}>
          <FaBookOpen style={{ fontSize: '50px', color: '#667eea' }} />
          <h1 style={{ color: '#333', marginTop: '10px' }}>EduNova</h1>
        </div>

        {status === 'loading' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <FaSpinner style={{ fontSize: '60px', color: '#667eea' }} />
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <FaCheckCircle style={{ fontSize: '80px', color: '#10b981', marginBottom: '20px' }} />
            <h2 style={{ color: '#10b981', marginBottom: '15px' }}>Email vérifié !</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            <p style={{ color: '#999', fontSize: '14px' }}>
              Redirection vers la page de connexion...
            </p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <FaTimesCircle style={{ fontSize: '80px', color: '#ef4444', marginBottom: '20px' }} />
            <h2 style={{ color: '#ef4444', marginBottom: '15px' }}>Erreur de vérification</h2>
            <p style={{ color: '#666', marginBottom: '30px' }}>{message}</p>
            
            <button
              onClick={handleResendEmail}
              disabled={resending}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: resending ? 'not-allowed' : 'pointer',
                marginBottom: '20px',
                opacity: resending ? 0.6 : 1,
                transition: 'all 0.3s'
              }}
            >
              {resending ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </button>
            
            <div>
              <Link
                to="/login"
                style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;