import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';
import api from './api';

// Importación de páginas
import HomePage from './pages/HomePage';
import TeamsPage from './pages/TeamsPage';
import MatchesPage from './pages/MatchesPage';
import StandingsPage from './pages/StandingsPage';
import LoginPage from './pages/LoginPage';
import TeamDetailPage from './pages/TeamDetailPage';
import SiteConfigPage from './pages/SiteConfigPage';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Configuración inicial segura
  const [config, setConfig] = useState({
    colores: { primary: '#c5a059', secondary: '#0e0e0e' },
    header: { titulo: 'EVOPLAY', subtitulo: 'LEAGUE' },
    hero: {},
    pages: { home: [] },
    footer: { texto: 'Cargando...', contacto: '' }
  });

  const navigate = useNavigate();

  // Verificar sesión al inicio
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  // Cargar configuración del sitio
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/api/config');
        if (data) {
          setConfig(data);
          // Aplicar estilos al documento
          const root = document.documentElement;
          if(data.colores?.primary) root.style.setProperty('--gold', data.colores.primary);
          if(data.colores?.secondary) root.style.setProperty('--bg-dark', data.colores.secondary);
          if(data.style?.fontFamily) document.body.className = data.style.fontFamily;
        }
      } catch (error) {
        console.log("Usando config por defecto");
      }
    };
    fetchConfig();
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      {/* NAVBAR */}
      <nav>
        <div className="nav-logo">
          {config.header?.titulo || 'EVOPLAY'} 
          <span style={{color:'var(--gold)', fontSize:'0.5em', marginLeft:'5px'}}>
            {config.header?.subtitulo}
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
      
      {/* CONTENIDO */}
      <div style={{flex: 1}}>
        <Routes>
          <Route path="/" element={<HomePage customConfig={config} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={handleLogin} />} />
          <Route path="/partidos" element={<MatchesPage />} />
          <Route path="/tabla" element={<StandingsPage />} />
          <Route path="/equipos/:id" element={<TeamDetailPage />} />
          
          <Route path="/equipos" element={
            <ProtectedRoute><TeamsPage /></ProtectedRoute>
          } />
          
          <Route path="/config" element={
            <ProtectedRoute><SiteConfigPage /></ProtectedRoute>
          } />
        </Routes>
      </div>

      <Footer customConfig={config} />
    </div>
  );
}

export default App;