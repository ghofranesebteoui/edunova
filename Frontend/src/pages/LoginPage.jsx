import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaBookOpen } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { auth, provider } from '../authGoogle';
import Swal from 'sweetalert2';

const LoginPage = ({ setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const redirectToDashboard = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'enseignant') navigate('/enseignant');
    else navigate('/etudiant');
  };

  const handleResendVerification = async () => {
    const email = document.querySelector('input[name="email"]').value;
    try {
      await axios.post('http://localhost:5000/api/auth/resend-verification', { email });
      setError('Email de vérification renvoyé ! Vérifiez votre boîte mail.');
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email");
    }
  };

  const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const googleData = {
      email: user.email,
      first_name: user.displayName?.split(" ")[0],
      last_name: user.displayName?.split(" ")[1] || "",
      uid: user.uid,
    };

    const res = await axios.post(
      "http://localhost:5000/api/auth/google-login",
      googleData
    );

    const { token, user: userData } = res.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);

    navigate(`/${userData.role}`);
  } catch (error) {
    console.error("❌ Erreur Google login:", error);
    setError("Erreur lors de la connexion avec Google.");
  }
};


  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const cred = {
      email: formData.get('email').trim(),
      password: formData.get('password'),
    };

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', cred);

      const token = res.data.data.token;
      const user = res.data.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);   // 🔥 Correction

      setError('');
      redirectToDashboard(user.role);
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        setError(
          <div>
            {err.response.data.error}
            <button
              type="button"
              style={{ marginLeft: '10px', textDecoration: 'underline', cursor: 'pointer' }}
              onClick={handleResendVerification}
            >
              Renvoyer l'email
            </button>
          </div>
        );
      } else {
        setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      first_name: formData.get('first_name').trim(),
      last_name: formData.get('last_name').trim(),
      email: formData.get('email').trim(),
      password: formData.get('password'),
      role: formData.get('role'),
    };

    if (data.password !== formData.get('confirm_password')) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/register', data);
      setError('');
      Swal.fire('Succès', 'Inscription réussie ! Un email de vérification a été envoyé.', 'success');
      setIsSignUp(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur inscription');
    }
  };

  return (
    <div className="login-page-wrapper">
      <AnimatePresence mode="wait">
        {!isSignUp ? (
          <motion.div key="login" className="page-content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            <motion.div className="form-section"
              initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}>
              <div className="login-form">
                <div className="logo-header">
                  <FaBookOpen className="book-icon" />
                  <h1>EduNova</h1>
                </div>
                <h2>Connexion à EduNova</h2>

                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="abc@xyz.com" required autoComplete="email" />
                  </div>
                  <div className="input-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" placeholder="••••••••" required autoComplete="current-password" />
                  </div>
                  <div className="options">
                    <label><input type="checkbox" /> Se souvenir de moi</label>
                    <Link to="/forget-password" className="forgot-password">Mot de passe oublié ?</Link>
                  </div>
                  <button type="submit" className="login-btn">Se connecter</button>
                </form>

                <div className="or-divider"><span>ou connectez-vous avec</span></div>
                <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                  <FcGoogle size={20} /> Google
                </button>

                <div className="switch-under-form">
                  <p>Pas de compte ?</p>
                  <button type="button" className="switch-btn under-form"
                    onClick={() => { setIsSignUp(true); setError(''); }}>
                    S'inscrire
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div className="promo-section"
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}>
              <div className="promo-content">
                <div className="logo-header">
                  <FaBookOpen className="book-icon large" />
                  <h1>EduNova</h1>
                </div>
                <p>Plateforme d'e-learning moderne pour développer vos compétences.</p>
                <div className="stats">
                  <div><strong>+1000</strong> cours</div>
                  <div><strong>Dans tous les domaines</strong></div>
                  <div><strong>50k+</strong> étudiants</div>
                  <div><strong>Communauté active</strong></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="signup" className="page-content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>

            <motion.div className="promo-section"
              initial={{ x: -400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}>
              <div className="promo-content">
                <div className="logo-header">
                  <FaBookOpen className="book-icon large" />
                  <h1>EduNova</h1>
                </div>
                <p>Rejoignez la communauté d'apprenants passionnés.</p>
              </div>
            </motion.div>

            <motion.div className="form-section"
              initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}>
              <div className="login-form">
                <div className="logo-header">
                  <FaBookOpen className="book-icon" />
                  <h1>EduNova</h1>
                </div>
                <h2>Créer un compte</h2>

                {error && <p className="error-msg">{error}</p>}

                <form onSubmit={handleRegister}>
                  <div className="input-row">
                    <div className="input-group half">
                      <label>Prénom</label>
                      <input type="text" name="first_name" placeholder="Jean" required autoComplete="given-name" />
                    </div>
                    <div className="input-group half">
                      <label>Nom</label>
                      <input type="text" name="last_name" placeholder="Dupont" required autoComplete="family-name" />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="jean.dupont@exemple.com" required autoComplete="email" />
                  </div>
                  <div className="input-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" placeholder="••••••••" required autoComplete="new-password" />
                  </div>
                  <div className="input-group">
                    <label>Confirmer le mot de passe</label>
                    <input type="password" name="confirm_password" placeholder="••••••••" required autoComplete="new-password" />
                  </div>
                  <div className="input-group">
                    <label>Rôle</label>
                    <select name="role" required>
                      <option value="">Choisir un rôle</option>
                      <option value="etudiant">Étudiant</option>
                      <option value="enseignant">Enseignant</option>
                    </select>
                  </div>
                  <button type="submit" className="login-btn">S'inscrire</button>
                </form>

                <div className="switch-under-form">
                  <p>Déjà un compte ?</p>
                  <button type="button" className="switch-btn under-form"
                    onClick={() => { setIsSignUp(false); setError(''); }}>
                    Se connecter
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
