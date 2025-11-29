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
  const [loading, setLoading] = useState(true);

  // --- CONFIGURACIÓN DE SEGURIDAD (PLAN B) ---
  // Si no llega configuración del CMS, usamos esta por defecto para que la página NO salga vacía.
  const defaultConfig = {
    hero: {
      titulo: 'EVOPLAY LEAGUE',
      subtitulo: 'TORNEO OFICIAL',
      imagenFondo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831'
    },
    pages: {
      home: [
        { type: 'banner', title: 'Inicio', isVisible: true },
        { type: 'upcoming', title: 'Próximos Partidos', isVisible: true },
        { type: 'recent', title: 'Resultados Recientes', isVisible: true },
        { type: 'scorers', title: 'Goleadores Destacados', isVisible: true }
      ]
    }
  };

  // Usamos la config que llega O la default
  const finalConfig = (customConfig && customConfig.pages && customConfig.pages.home.length > 0) 
    ? customConfig 
    : defaultConfig;

  const heroTitle = finalConfig.hero?.titulo || defaultConfig.hero.titulo;
  const heroSubtitle = finalConfig.hero?.subtitulo || defaultConfig.hero.subtitulo;
  const bgImage = finalConfig.hero?.imagenFondo || defaultConfig.hero.imagenFondo;
  const widgets = finalConfig.pages?.home || defaultConfig.pages.home;

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Pedimos datos generales (sin filtro de categoría para mostrar todo lo relevante)
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/partidos/stats/top-players') 
        ]);
        
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          // La API de stats devuelve un objeto { goleadores: [], ... }
          scorers: scRes.data.goleadores && Array.isArray(scRes.data.goleadores) ? scRes.data.goleadores : []
        });
      } catch (error) {
        console.error("Error cargando datos del Home (Usando vacíos)", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- RENDERIZADOR DE WIDGETS ---
  const renderWidget = (widget, index) => {
    if (!widget || !widget.isVisible) return null;
    
    const titleStyle = {
      borderLeft: '4px solid var(--gold)', 
      paddingLeft: '10px', 
      marginBottom: '20px',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      fontFamily: 'Oswald, sans-serif'
    };

    switch (widget.type) {
      case 'banner':
        return (
          <div key={index} className="hero-section" style={{
            marginBottom: '50px',
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), var(--bg-dark)), url('${bgImage}')`
          }}>
            <div className="hero-content">
              <p style={{color:'var(--gold)', letterSpacing:'2px', fontWeight:'bold'}}>{heroSubtitle}</p>
              <h1 style={{fontSize:'4rem', margin:'10px 0'}}>{heroTitle}</h1>
            </div>
          </div>
        );

      case 'upcoming': 
        return (
          <div key={index} className="main-container" style={{marginBottom:'50px'}}>
            <h2 style={titleStyle}>{widget.title}</h2>
            <UpcomingMatchesWidget matches={data.upcoming} />
          </div>
        );

      case 'recent': 
        return (
          <div key={index} className="main-container" style={{marginBottom:'50px'}}>
            <h2 style={{...titleStyle, borderColor:'#4ade80'}}>{widget.title}</h2>
            <RecentMatchesWidget matches={data.recent} />
          </div>
        );

      case 'scorers': 
        return (
          <div key={index} className="main-container" style={{marginBottom:'50px'}}>
            <h2 style={titleStyle}>{widget.title}</h2>
            <TopScorersWidget scorers={data.scorers} />
          </div>
        );

      case 'text': 
        return (
          <div key={index} className="main-container" style={{marginBottom:'50px'}}>
            <div className="news-card" style={{background:'#1a1a1a', padding:'30px', borderRadius:'12px', borderLeft:'5px solid var(--gold)'}}>
              <h3 style={{color:'var(--gold)', marginTop:0}}>{widget.title}</h3>
              <p style={{whiteSpace:'pre-wrap', color:'#ddd', fontSize:'1.1rem'}}>{widget.content}</p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  if (loading) return <div style={{height:'60vh', display:'flex', justifyContent:'center', alignItems:'center', color:'var(--gold)', fontSize:'1.5rem'}}>Cargando EvoPlay...</div>;

  return (
    <div>
      {widgets.map((widget, index) => renderWidget(widget, index))}
    </div>
  );
}

export default HomePage;