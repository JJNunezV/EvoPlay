import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [upcomingRes, recentRes, scorersRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/equipos/stats/goleadores')
        ]);
        
        setUpcomingMatches(upcomingRes.data);
        setRecentMatches(recentRes.data);
        setTopScorers(scorersRes.data);
      } catch (error) {
        console.error("Error al cargar dashboard", error);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div>
      {/* --- HERO BANNER (El Estadio Gigante) --- */}
      <div className="hero-section">
        <div className="hero-content">
          <p>TORNEO CLAUSURA 2025</p>
          <h1>EVOPLAY LEAGUE</h1>
          <button style={{marginTop: '20px', fontSize: '1.2rem', padding: '15px 40px'}}>
            VER RESULTADOS
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="main-container">
        <div className="dashboard-grid">
          
          {/* Columna Izquierda: La Acción */}
          <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div>
                <h2>🔥 Matchday</h2>
                <UpcomingMatchesWidget matches={upcomingMatches} />
            </div>
            <div>
                <h2>📊 Últimos Resultados</h2>
                <RecentMatchesWidget matches={recentMatches} />
            </div>
          </div>

          {/* Columna Derecha: Estadísticas */}
          <div>
            <h2>🏆 Pichichi / Goleadores</h2>
            <TopScorersWidget scorers={topScorers} />
            
            {/* Widget Extra de publicidad o aviso */}
            <div className="widget" style={{marginTop: '30px', background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)'}}>
                <h3 style={{color: 'white'}}>INSCRIPCIONES ABIERTAS</h3>
                <p style={{color: '#aaa', fontSize: '0.9rem'}}>Registra a tu equipo para la próxima temporada. Cupos limitados.</p>
                <button style={{width: '100%', marginTop:'10px', background: 'transparent', border: '1px solid #fff', color: '#fff'}}>CONTÁCTANOS</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;