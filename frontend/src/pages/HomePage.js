import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({
    upcoming: [],
    recent: [],
    scorers: []
  });

  // Valores por defecto si la config aún no carga
  const heroTitle = customConfig?.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = customConfig?.hero?.subtitulo || 'TORNEO CLAUSURA 2025';
  const bgImage = customConfig?.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';

  // Configuración del Layout (o valores default si es la primera vez)
  const layout = customConfig?.layout?.home || {
    section1: 'upcoming', title1: '🔥 Matchday',
    section2: 'recent',   title2: '📊 Resultados',
    section3: 'scorers',  title3: '🏆 Goleadores'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/equipos/stats/goleadores')
        ]);
        setData({
          upcoming: upRes.data,
          recent: recRes.data,
          scorers: scRes.data
        });
      } catch (error) { console.error("Error cargando datos", error); }
    };
    loadData();
  }, []);

  // Función mágica para renderizar el componente correcto según el nombre
  const renderWidget = (type, title) => {
    if (type === 'none') return null;
    
    return (
      <div style={{marginBottom: '30px'}}>
        {title && <h2 style={{fontSize:'1.5rem', marginBottom:'15px'}}>{title}</h2>}
        
        {type === 'upcoming' && <UpcomingMatchesWidget matches={data.upcoming} />}
        {type === 'recent' && <RecentMatchesWidget matches={data.recent} />}
        {type === 'scorers' && <TopScorersWidget scorers={data.scorers} />}
      </div>
    );
  };

  return (
    <div>
      {/* HERO BANNER */}
      <div className="hero-section" style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-dark)), url('${bgImage}')`
      }}>
        <div className="hero-content">
          <p>{heroSubtitle}</p>
          <h1>{heroTitle}</h1>
          <button style={{marginTop: '20px', fontSize: '1.2rem', padding: '15px 40px'}}>VER RESULTADOS</button>
        </div>
      </div>

      {/* LAYOUT DINÁMICO */}
      <div className="main-container">
        <div className="dashboard-grid">
          
          {/* Columna Izquierda (Flexible) */}
          <div style={{display:'flex', flexDirection:'column'}}>
            {renderWidget(layout.section1, layout.title1)}
            {renderWidget(layout.section2, layout.title2)}
          </div>

          {/* Columna Derecha (Lateral) */}
          <div>
            {renderWidget(layout.section3, layout.title3)}
            
            {/* Widget Fijo de Publicidad (Opcional) */}
            <div className="widget" style={{background: 'linear-gradient(45deg, #1a1a1a, #2a2a2a)'}}>
                <h3 style={{color: 'white'}}>ÚNETE A LA LIGA</h3>
                <p style={{color: '#aaa', fontSize: '0.9rem'}}>Inscripciones abiertas.</p>
                <button style={{width: '100%', marginTop:'10px', background: 'transparent', border: '1px solid #fff', color: '#fff'}}>CONTACTO</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;