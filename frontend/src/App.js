import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import api from './api'; // Nuestro mensajero

// Importación de Páginas
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SiteConfigPage from './pages/SiteConfigPage'; // El nuevo editor
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Configuración de las animaciones de página
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
  const [config, setConfig] = useState(null); // Aquí guardamos tu diseño personalizado
  
  const navigate = useNavigate();
  const location = useLocation();

  // --- EFECTO MÁGICO: CARGAR TU DISEÑO ---
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const { data } = await api.get('/api/config');
        setConfig(data);

        // 1. Aplicar Colores a las Variables CSS
        const root = document.documentElement;
        if (data.style?.primaryColor) {
          root.style.setProperty('--gold', data.style.primaryColor);
        }
        if (data.style?.secondaryColor) {
          root.style.setProperty('--bg-dark', data.style.secondaryColor);
        }

        // 2. Aplicar la Fuente al Body (Moderno, Sport, Clásico, etc.)
        const fontClass = data.style?.fontFamily || 'font-modern';
        document.body.className = fontClass;

      } catch (error) {
        console.error("Usando tema por defecto (Error al cargar config)");
        document.body.className = 'font-modern';
      }
    };
    applyTheme();
  }, []);

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
      
      {/* --- HEADER DINÁMICO --- */}
      <nav>
        <div className="nav-logo">
          {config?.header?.titulo || 'EVOPLAY'} 
          <span style={{color:'var(--gold)', fontSize:'0.5em', marginLeft:'5px'}}>
            {config?.header?.subtitulo || 'LEAGUE'}
          </span>
        </div>
        
        <div className="nav-links">
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/partidos" className="nav-item">Partidos</Link>
          <Link to="/tabla" className="nav-item">Tabla</Link>
          
          {/* Enlaces solo para Admin */}
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
      
      {/* --- CONTENIDO DE PÁGINAS --- */}
      <div style={{flex: 1}}>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            
            {/* Pasamos 'customConfig' a HomePage para que sepa qué pintar */}
            <Route path="/" element={<AnimatedPage><HomePage customConfig={config} /></AnimatedPage>} />
            
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

            <Route
              path="/config"
              element={
                <ProtectedRoute>
                  <AnimatedPage><SiteConfigPage /></AnimatedPage>
                </ProtectedRoute>
              }
            />

          </Routes>
        </AnimatePresence>
      </div>

      {/* --- FOOTER DINÁMICO --- */}
      <Footer customConfig={config} />
    </div>
  );
}

export default App;