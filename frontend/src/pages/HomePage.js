import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });
  const [loading, setLoading] = useState(true);
  
  // Puedes cambiar esto por la categoría que quieras mostrar en la Portada
  const categoriaDefault = 'Fútbol 7'; 

  // Configuración segura
  const safeConfig = customConfig || {};
  const heroTitle = safeConfig.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = safeConfig.hero?.subtitulo || 'TORNEO CLAUSURA';
  const bgImage = safeConfig.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';
  
  const widgetsDefault = [
    { type: 'banner', title: 'Bienvenido', isVisible: true },
    { type: 'upcoming', title: `Próximos Partidos (${categoriaDefault})`, isVisible: true },
    { type: 'recent', title: `Resultados (${categoriaDefault})`, isVisible: true },
    { type: 'scorers', title: `Goleadores (${categoriaDefault})`, isVisible: true }
  ];

  const widgets = (safeConfig.pages?.home && Array.isArray(safeConfig.pages.home) && safeConfig.pages.home.length > 0) 
    ? safeConfig.pages.home 
    : widgetsDefault;

  useEffect(() => {
    const loadData = async () => {
      try {
        // AGREGAMOS ?categoria=... para que el backend sepa qué filtrar
        const [upRes, recRes, scRes] = await Promise.all([
          api.get(`/api/partidos/proximos?categoria=${categoriaDefault}`),
          api.get(`/api/partidos/recientes?categoria=${categoriaDefault}`),
          api.get(`/api/partidos/stats/top-players?categoria=${categoriaDefault}`)
        ]);
        
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          scorers: scRes.data.goleadores && Array.isArray(scRes.data.goleadores) ? scRes.data.goleadores : []
        });
      } catch (error) {
        console.error("Error cargando datos del Home", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
              <button style={{marginTop:'20px', fontSize:'1.2rem', padding:'12px 30px', borderRadius:'30px'}}>VER RESULTADOS</button>
            </div>
          </div>
        );
      case 'upcoming': 
        return <div key={index} className="main-container" style={{marginBottom:'50px'}}><h2 style={titleStyle}>{widget.title}</h2><UpcomingMatchesWidget matches={data.upcoming} /></div>;
      case 'recent': 
        return <div key={index} className="main-container" style={{marginBottom:'50px'}}><h2 style={{...titleStyle, borderColor:'#4ade80'}}>{widget.title}</h2><RecentMatchesWidget matches={data.recent} /></div>;
      case 'scorers': 
        return <div key={index} className="main-container" style={{marginBottom:'50px'}}><h2 style={titleStyle}>{widget.title}</h2><TopScorersWidget scorers={data.scorers} /></div>;
      case 'text': 
        return <div key={index} className="main-container" style={{marginBottom:'50px'}}><div className="news-card" style={{background:'#1a1a1a', padding:'30px', borderRadius:'12px', borderLeft:'5px solid var(--gold)'}}><h3 style={{color:'var(--gold)', marginTop:0}}>{widget.title}</h3><p style={{whiteSpace:'pre-wrap', color:'#ddd', fontSize:'1.1rem'}}>{widget.content}</p></div></div>;
      default: return null;
    }
  };

  if (loading) return <div style={{height:'60vh', display:'flex', justifyContent:'center', alignItems:'center', color:'var(--gold)', fontSize:'1.5rem'}}>Cargando EvoPlay...</div>;

  return <div>{widgets.map((widget, index) => renderWidget(widget, index))}</div>;
}

export default HomePage;