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

  // Si no hay config aún, usamos un array vacío para que no truene
  const widgets = customConfig?.pages?.home || [];

  // Datos por defecto para el Banner si no hay config
  const heroTitle = customConfig?.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = customConfig?.hero?.subtitulo || 'TORNEO CLAUSURA';
  const bgImage = customConfig?.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';

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
      } catch (error) {
        console.error("Error cargando datos del dashboard", error);
      }
    };
    loadData();
  }, []);

  // --- FUNCIÓN QUE DIBUJA CADA SECCIÓN ---
  const renderWidget = (widget, index) => {
    if (!widget.isVisible) return null;

    const title = <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'10px', marginBottom:'20px'}}>{widget.title}</h2>;

    switch (widget.type) {
      case 'banner':
        return (
          <div key={index} className="hero-section" style={{
            marginBottom: '40px',
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-dark)), url('${bgImage}')`
          }}>
            <div className="hero-content">
              <p>{heroSubtitle}</p>
              <h1>{heroTitle}</h1>
              <button className="cta-button" style={{marginTop: '20px', fontSize: '1.2rem'}}>VER RESULTADOS</button>
            </div>
          </div>
        );

      case 'upcoming':
        return (
          <div key={index} className="main-container" style={{marginBottom:'40px'}}>
            {title}
            <UpcomingMatchesWidget matches={data.upcoming} />
          </div>
        );

      case 'recent':
        return (
          <div key={index} className="main-container" style={{marginBottom:'40px'}}>
            {title}
            <RecentMatchesWidget matches={data.recent} />
          </div>
        );

      case 'scorers':
        return (
          <div key={index} className="main-container" style={{marginBottom:'40px'}}>
            {title}
            <TopScorersWidget scorers={data.scorers} />
          </div>
        );

      // 👇 AQUÍ ESTÁ EL NUEVO WIDGET DE NOTICIAS/TEXTO
      case 'text':
        return (
          <div key={index} className="main-container" style={{marginBottom:'40px'}}>
            <div className="news-card">
              <h3>{widget.title}</h3>
              <p style={{whiteSpace: 'pre-wrap'}}>{widget.content}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Si no hay widgets configurados en el admin, mostramos un mensaje */}
      {widgets.length === 0 && (
        <div className="hero-section">
          <div className="hero-content">
            <h1>{heroTitle}</h1>
            <p>Sitio en construcción. Configura los widgets en el panel de Admin.</p>
          </div>
        </div>
      )}
      
      {/* Renderizamos cada widget en el orden que viene de la base de datos */}
      {widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
}

export default HomePage;