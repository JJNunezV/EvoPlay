import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });
  const [loading, setLoading] = useState(true);

  // Si customConfig no está listo, usamos un objeto seguro
  const safeConfig = customConfig || { hero: {}, pages: { home: [] } };
  
  const heroTitle = safeConfig.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = safeConfig.hero?.subtitulo || 'TORNEO CLAUSURA';
  const bgImage = safeConfig.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';
  
  // Si la lista de widgets está vacía, ponemos unos por defecto para que no se vea vacío
  const widgets = (safeConfig.pages?.home?.length > 0) 
    ? safeConfig.pages.home 
    : [
        { type: 'banner', title: 'Bienvenido', isVisible: true },
        { type: 'upcoming', title: 'Próximos Partidos', isVisible: true },
        { type: 'scorers', title: 'Goleadores', isVisible: true }
      ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/equipos/stats/goleadores')
        ]);
        setData({ upcoming: upRes.data, recent: recRes.data, scorers: scRes.data });
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Cargando datos...</div>;

  return (
    <div>
      {widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
}

export default HomePage;