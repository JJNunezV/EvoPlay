import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import api from './api';

import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SiteConfigPage from './pages/SiteConfigPage';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 };

const AnimatedPage = ({ children }) => (
  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
    {children}
  </motion.div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  // Iniciamos con un objeto vacío seguro en lugar de null
  const [config, setConfig] = useState({
    colores: { primary: '#c5a059', secondary: '#0e0e0e' },
    header: { titulo: 'EVOPLAY', subtitulo: 'LEAGUE' },
    hero: {},
    pages: { home: [] },
    footer: {}
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const applyTheme = async () => {
      try {
        const { data } = await api.get('/api/config');
        if (data) {
          setConfig(data);
          // Aplicar colores de forma segura
          const root = document.documentElement;
          if (data.colores?.primary) root.style.setProperty('--gold', data.colores.primary);
          if (data.colores?.secondary) root.style.setProperty('--bg-dark', data.colores.secondary);
          
          if (data.style?.fontFamily) document.body.className = data.style.fontFamily;
        }
      } catch (error) {
        console.log("Usando configuración por defecto");
      }
    };
    applyTheme();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <nav>
        <div className="nav-logo">
          {config.header?.titulo || 'EVOPLAY'} 
          <span style={{color:'var(--gold)', fontSize:'0.5em', marginLeft:'5px'}}>
            {config.header?.subtitulo || 'LEAGUE'}
          </span>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/partidos" className="nav-item">Partidos</Link>
          <Link to="/tabla" className="nav-item">Tabla</Link>
          {isAuthenticated && (
            <>
              <Link to="/equipos" className="nav-item" style={{color:'var(--gold)'}}>Equipos</Link>
              <Link to="/config" className="nav-item" style={{color:'#00d2ff'}}>Diseño</Link>
            </>
          )}
        </div>
        <div>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">Salir</button>
          ) : (
            <Link to="/login" className="nav-item">Admin</Link>
          )}
        </div>
      </nav>
      
      <div style={{flex: 1}}>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><HomePage customConfig={config} /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><LoginPage onLoginSuccess={handleLogin} /></AnimatedPage>} />
            <Route path="/partidos" element={<AnimatedPage><MatchesPage /></AnimatedPage>} />
            <Route path="/tabla" element={<AnimatedPage><StandingsPage /></AnimatedPage>} />
            <Route path="/equipos/:id" element={<AnimatedPage><TeamDetailPage /></AnimatedPage>} />
            
            <Route path="/equipos" element={<ProtectedRoute><AnimatedPage><TeamsPage /></AnimatedPage></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute><AnimatedPage><SiteConfigPage /></AnimatedPage></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer customConfig={config} />
    </div>
  );
}

export default App;