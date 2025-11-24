import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });

  // Obtenemos la lista de widgets desde la config (o un array vacío si no existe)
  const widgets = customConfig?.pages?.home || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/equipos/stats/goleadores')
        ]);
        setData({ upcoming: upRes.data, recent: recRes.data, scorers: scRes.data });
      } catch (error) { console.error("Error cargando datos", error); }
    };
    loadData();
  }, []);

  // Función que decide qué componente pintar
  const renderWidget = (widget, index) => {
    const title = <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'10px', marginBottom:'20px'}}>{widget.title}</h2>;

    switch (widget.type) {
      case 'banner':
        return (
          <div key={index} className="hero-section" style={{marginBottom: '40px'}}>
            <div className="hero-content">
              <h1>{widget.title}</h1>
              <p>{customConfig?.hero?.subtitulo}</p>
            </div>
          </div>
        );
      case 'upcoming':
        return <div key={index} style={{marginBottom:'40px'}}>{title}<UpcomingMatchesWidget matches={data.upcoming} /></div>;
      case 'recent':
        return <div key={index} style={{marginBottom:'40px'}}>{title}<RecentMatchesWidget matches={data.recent} /></div>;
      case 'scorers':
        return <div key={index} style={{marginBottom:'40px'}}>{title}<TopScorersWidget scorers={data.scorers} /></div>;
      case 'text':
        return <div key={index} className="widget" style={{marginBottom:'40px'}}><h3>{widget.title}</h3><p>Texto personalizado...</p></div>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Si no hay widgets configurados, mostramos un mensaje */}
      {widgets.length === 0 && <p style={{textAlign:'center', marginTop:'50px'}}>Sitio en construcción / Configuración vacía.</p>}
      
      {/* Renderizamos la lista de widgets en el orden que vienen */}
      <div className="main-container" style={{paddingTop: '20px'}}>
        {widgets.map((widget, index) => renderWidget(widget, index))}
      </div>
    </div>
  );
}

export default HomePage;