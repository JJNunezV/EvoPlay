import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import api from './api'; // IMPORTANTE: Importar api

// ... tus imports de páginas ...
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import SiteConfigPage from './pages/SiteConfigPage'; // <-- NUEVA PÁGINA

// ... variantes de animación ...
const pageVariants = { initial: { opacity: 0, y: 20 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -20 } };
const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.5 };
const AnimatedPage = ({ children }) => <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>{children}</motion.div>;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  // Estado para la config global
  const [config, setConfig] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // EFECTO MÁGICO: Cargar configuración y aplicar colores
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const { data } = await api.get('/api/config');
        setConfig(data);

        // INYECTAR VARIABLES CSS EN EL DOM
        const root = document.documentElement;
        root.style.setProperty('--gold', data.colores.primary);
        root.style.setProperty('--bg-dark', data.colores.secondary);
        // Si el fondo es claro, podríamos cambiar el texto a negro, pero por ahora mantendremos la lógica dark mode
        
      } catch (error) {
        console.error("Usando tema por defecto");
      }
    };
    applyTheme();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); navigate('/'); };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <nav>
        <div className="nav-logo">EVOPLAY <span style={{color:'white', fontSize:'0.5em'}}>LEAGUE</span></div>
        <div className="nav-links">
          <Link to="/" className="nav-item">Inicio</Link>
          <Link to="/partidos" className="nav-item">Partidos</Link>
          <Link to="/tabla" className="nav-item">Tabla</Link>
          {isAuthenticated && (
            <>
              <Link to="/equipos" className="nav-item" style={{color:'var(--gold)'}}>Equipos</Link>
              {/* NUEVO LINK PARA ADMIN */}
              <Link to="/config" className="nav-item" style={{color:'#00d2ff'}}>Diseño</Link> 
            </>
          )}
        </div>
        <div>
          {isAuthenticated ? <button onClick={handleLogout} className="logout-btn">Salir</button> : <Link to="/login" className="nav-item">Admin</Link>}
        </div>
      </nav>

      
      <div className="nav-logo">
       {/* Usamos config o valores por defecto */}
         {config?.header?.titulo || 'EVOPLAY'} 
         <span style={{color:'#c5a059', fontSize:'0.5em', marginLeft:'5px'}}>
        {config?.header?.subtitulo || 'LEAGUE'}
       </span>
      </div>
      
      <div style={{flex: 1}}>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            {/* Pasamos la config a HomePage para que use el texto/imagen dinámicos */}
            <Route path="/" element={<AnimatedPage><HomePage customConfig={config} /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><LoginPage onLoginSuccess={handleLogin} /></AnimatedPage>} />
            <Route path="/partidos" element={<AnimatedPage><MatchesPage /></AnimatedPage>} />
            <Route path="/tabla" element={<AnimatedPage><StandingsPage /></AnimatedPage>} />
            <Route path="/equipos/:id" element={<AnimatedPage><TeamDetailPage /></AnimatedPage>} />
            
            <Route path="/equipos" element={<ProtectedRoute><AnimatedPage><TeamsPage /></AnimatedPage></ProtectedRoute>} />
            
            {/* NUEVA RUTA PROTEGIDA */}
            <Route path="/config" element={<ProtectedRoute><AnimatedPage><SiteConfigPage /></AnimatedPage></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer customConfig={config} />
    </div>
  );
}

export default App;