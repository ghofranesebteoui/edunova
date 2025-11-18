import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/forgetPass";
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur parsing user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <Router>
      <div className="App">
        {user && (
          <nav
            style={{
              padding: "1rem",
              background: "#6a1b9a",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h3>Bienvenue, {user.first_name || user.email}</h3>
            <button
              onClick={handleLogout}
              style={{
                background: "white",
                color: "#6a1b9a",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Déconnexion
            </button>
          </nav>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              !user ? (
                <LoginPage setUser={setUser} />
              ) : (
                <Navigate to={`/${user.role}`} replace />
              )
            }
          />
          <Route
            path="/etudiant"
            element={
              user?.role === "etudiant" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/enseignant"
            element={
              user?.role === "enseignant" ? (
                <TeacherDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          
          {/* Routes publiques */}
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Route par défaut - redirige vers /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;