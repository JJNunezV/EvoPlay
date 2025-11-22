import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link>
        {/* Solo mostramos el link de Equipos si es admin, pero la protección real está abajo */}
        {isAuthenticated && <Link to="/equipos">Equipos</Link>}
        <Link to="/partidos">Partidos</Link>
        <Link to="/tabla">Tabla de Posiciones</Link>
        
        {isAuthenticated ? (
          <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
        ) : (
          <Link to="/login">Admin Login</Link>
        )}
      </nav>
      
      <div className="main-content">
        <Routes>
          {/* --- RUTAS PÚBLICAS (Cualquiera puede entrar) --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          
          {/* 👇 ¡AQUÍ ESTÁ LA CLAVE! Partidos y Tabla están AFUERA del candado 👇 */}
          <Route path="/partidos" element={<MatchesPage />} />
          <Route path="/tabla" element={<StandingsPage />} />
          <Route path="/equipos/:id" element={<TeamDetailPage />} />
          
          {/* --- RUTA PRIVADA (Solo Admin) --- */}
          <Route
            path="/equipos"
            element={
              <ProtectedRoute>
                <TeamsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;