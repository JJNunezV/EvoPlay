import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });
  const [loading, setLoading] = useState(true);

  const safeConfig = customConfig || {};
  const heroTitle = safeConfig.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = safeConfig.hero?.subtitulo || 'TORNEO OFICIAL';
  const bgImage = safeConfig.hero?.imagenFondo || '[https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831](https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831)';

  const widgetsDefault = [
    { type: 'banner', title: 'Inicio', isVisible: true },
    { type: 'upcoming', title: 'Próximos Partidos', isVisible: true },
    { type: 'recent', title: 'Resultados Recientes', isVisible: true },
    { type: 'scorers', title: 'Goleadores', isVisible: true }
  ];

  const widgets = safeConfig.pages?.home?.length > 0 ? safeConfig.pages.home : widgetsDefault;

  useEffect(() => {
    const loadData = async () => {
      try {
        // Pedimos datos para F7 por defecto para que se vea lleno
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos?categoria=Fútbol 7'),
          api.get('/api/partidos/recientes?categoria=Fútbol 7'),
          api.get('/api/partidos/stats/top-players?categoria=Fútbol 7')
        ]);
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          scorers: scRes.data.goleadores || []
        });
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const renderWidget = (widget, index) => {
    if (!widget || !widget.isVisible) return null;

    switch (widget.type) {
      case 'banner':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            key={index} 
            className="hero-section" 
            style={{
              marginBottom: '60px',
              height: '75vh',
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--dark-bg)), url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed', // Efecto Parallax
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
            }}
          >
            <div style={{zIndex: 2}}>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                style={{color:'var(--gold)', letterSpacing:'5px', fontWeight:'900', fontSize:'1.2rem', textTransform:'uppercase', marginBottom:'10px'}}
              >
                {heroSubtitle}
              </motion.p>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                style={{fontSize:'5rem', margin:0, textShadow:'0 10px 30px rgba(0,0,0,0.5)'}}
              >
                {heroTitle}
              </motion.h1>
              <motion.button 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
                style={{marginTop:'30px', fontSize:'1.2rem', padding:'15px 40px', borderRadius:'50px'}}
              >
                VER RESULTADOS
              </motion.button>
            </div>
          </motion.div>
        );

      case 'upcoming': 
        return (
          <div key={index} style={{maxWidth:'1200px', margin:'0 auto 60px', padding:'0 20px'}}>
            <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'15px', color:'white'}}>{widget.title}</h2>
            <UpcomingMatchesWidget matches={data.upcoming} />
          </div>
        );
      // ... (Los otros casos son similares, usa el layout que prefieras) ...
      default: return null;
    }
  };

  if(loading) return <div style={{height:'80vh', display:'flex', justifyContent:'center', alignItems:'center'}}>Cargando...</div>;

  return <div>{widgets.map((w, i) => renderWidget(w, i))}</div>;
}

export default HomePage;