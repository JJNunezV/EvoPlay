import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Configuración de la animación
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
};

// Componente para animar las páginas
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      {/* --- HEADER PREMIUM --- */}
      <nav>
        <div className="nav-logo">EVOPLAY <span style={{color:'#fff', fontSize:'0.5em'}}>LEAGUE</span></div>
        <div className="nav-links">
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/partidos" className="nav-item">Partidos</Link>
          <Link to="/tabla" className="nav-item">Tabla</Link>
          {isAuthenticated && <Link to="/equipos" className="nav-item" style={{color:'#c5a059'}}>Gestión</Link>}
        </div>
        <div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
          ) : (
            <Link to="/login" className="nav-item">Admin</Link>
          )}
        </div>
      </nav>
      
      {/* --- CONTENIDO PRINCIPAL --- */}
      <div style={{flex: 1}}>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><HomePage /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><LoginPage onLoginSuccess={handleLogin} /></AnimatedPage>} />
            <Route path="/partidos" element={<AnimatedPage><MatchesPage /></AnimatedPage>} />
            <Route path="/tabla" element={<AnimatedPage><StandingsPage /></AnimatedPage>} />
            <Route path="/equipos/:id" element={<AnimatedPage><TeamDetailPage /></AnimatedPage>} />
            
            <Route
              path="/equipos"
              element={
                <ProtectedRoute>
                  <AnimatedPage><TeamsPage /></AnimatedPage>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
}

export default App;