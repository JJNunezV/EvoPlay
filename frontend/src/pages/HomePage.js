import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });
  
  // --- CONFIGURACIÓN POR DEFECTO (PLAN B) ---
  // Si customConfig viene vacío, usamos esto para que NO se vea nada en blanco
  const defaultConfig = {
    hero: {
      titulo: 'EVOPLAY LEAGUE',
      subtitulo: 'TORNEO OFICIAL',
      imagenFondo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831'
    },
    pages: {
      home: [
        { type: 'banner', title: 'Banner', isVisible: true },
        { type: 'upcoming', title: 'Próximos Partidos', isVisible: true },
        { type: 'recent', title: 'Resultados Recientes', isVisible: true },
        { type: 'scorers', title: 'Tabla de Goleadores', isVisible: true }
      ]
    }
  };

  // Mezclamos la config que llega con la default
  const finalConfig = customConfig && customConfig.pages?.home?.length > 0 
    ? customConfig 
    : defaultConfig;

  const heroTitle = finalConfig.hero?.titulo || defaultConfig.hero.titulo;
  const heroSubtitle = finalConfig.hero?.subtitulo || defaultConfig.hero.subtitulo;
  const bgImage = finalConfig.hero?.imagenFondo || defaultConfig.hero.imagenFondo;
  const widgets = finalConfig.pages?.home || defaultConfig.pages.home;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/equipos/stats/goleadores')
        ]);
        
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          scorers: Array.isArray(scRes.data) ? scRes.data : []
        });
      } catch (error) {
        console.error("Error cargando datos", error);
      }
    };
    loadData();
  }, []);

  const renderWidget = (widget, index) => {
    if (!widget.isVisible) return null;
    
    // Título dorado
    const title = <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'10px', marginBottom:'20px', color:'white'}}>{widget.title}</h2>;

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
            </div>
          </div>
        );
      case 'upcoming': return <div key={index} className="main-container" style={{marginBottom:'40px'}}>{title}<UpcomingMatchesWidget matches={data.upcoming} /></div>;
      case 'recent': return <div key={index} className="main-container" style={{marginBottom:'40px'}}>{title}<RecentMatchesWidget matches={data.recent} /></div>;
      case 'scorers': return <div key={index} className="main-container" style={{marginBottom:'40px'}}>{title}<TopScorersWidget scorers={data.scorers} /></div>;
      case 'text': return <div key={index} className="main-container" style={{marginBottom:'40px'}}><div className="news-card"><h3>{widget.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{widget.content}</p></div></div>;
      default: return null;
    }
  };

  return (
    <div>
      {widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
}

export default HomePage;