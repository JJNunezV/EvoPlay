import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Importamos el motor de animación
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

// Definimos cómo se mueven las páginas
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -20, scale: 0.98 }
};

const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.4 };

// Componente envoltorio para animar
const AnimatedPage = ({ children }) => (
  <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
    {children}
  </motion.div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [config, setConfig] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Necesario para saber cuándo cambió la ruta

  useEffect(() => {
    api.get('/api/config').then(res => {
      if(res.data) {
        setConfig(res.data);
        const root = document.documentElement;
        if(res.data.colores?.primary) root.style.setProperty('--gold', res.data.colores.primary);
        if(res.data.colores?.secondary) root.style.setProperty('--dark-bg', res.data.colores.secondary);
      }
    }).catch(err => console.log("Usando defaults"));
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); navigate('/'); };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <nav>
        <div className="nav-logo">
          {config?.header?.titulo || 'EVOPLAY'} 
          <span style={{color:'var(--gold)', marginLeft:'5px'}}>{config?.header?.subtitulo || 'LEAGUE'}</span>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/partidos" className="nav-item">Partidos</Link>
          <Link to="/tabla" className="nav-item">Tabla</Link>
          {isAuthenticated && (
            <>
              <Link to="/equipos" className="nav-item" style={{color:'var(--gold)'}}>Gestión</Link>
              <Link to="/config" className="nav-item" style={{color:'#6366f1'}}>Diseño</Link>
            </>
          )}
        </div>
        <div>
          {isAuthenticated ? 
            <button onClick={handleLogout} style={{background:'transparent', border:'1px solid var(--gold)', color:'var(--gold)', padding:'8px 20px'}}>SALIR</button> 
            : <Link to="/login" className="nav-item">ADMIN</Link>
          }
        </div>
      </nav>
      
      <div style={{flex: 1, padding: '20px'}}>
        {/* AnimatePresence detecta cuando un componente sale del DOM */}
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