import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import TeamDetailPage from './pages/TeamDetailPage';

function App() {
  // Aquí usamos React.useState para crear el estado correctamente
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('token'));
  const navigate = useNavigate(); // Hook para redirigir después del logout

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Borra el token
    setIsAuthenticated(false);
    navigate('/'); // Redirige al inicio después de cerrar sesión
  };

  return (
    <div>
      <nav>
        <Link to="/">Inicio</Link>
        {/* Mostramos el enlace a Equipos solo si está autenticado para más claridad */}
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
          <Route path="/" element={<HomePage />} />
          <Route path="/partidos"element={<ProtectedRoute><MatchesPage /></ProtectedRoute>}/>
          <Route path="/tabla" element={<StandingsPage />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          <Route path="/equipos/:id" element={<TeamDetailPage />} />

          {/* Ruta Protegida */}
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