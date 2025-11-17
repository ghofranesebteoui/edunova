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
import ResetPassword from './pages/ResetPassword'; // ⬅️ Import ajouté

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
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
            <h3>Bienvenue, {user.email}</h3>
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
                <Navigate to={`/${user.role}`} />
              )
            }
          />
          <Route
            path="/etudiant"
            element={
              user?.role === "etudiant" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/enseignant"
            element={
              user?.role === "enseignant" ? (
                <TeacherDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/student" element={<StudentDashboard />} />
          
          {/* Routes de réinitialisation de mot de passe */}
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* ⬅️ Nouvelle route */}
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;