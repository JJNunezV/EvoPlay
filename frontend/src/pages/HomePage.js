import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget';
import RecentMatchesWidget from '../components/RecentMatchesWidget';

function HomePage({ customConfig }) {
  // 1. Configuración Inicial
  const safeConfig = customConfig || {};
  const heroTitle = safeConfig.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = safeConfig.hero?.subtitulo || 'TORNEO CLAUSURA';
  const bgImage = safeConfig.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';

  // 2. Lista de Deportes para el Carrusel
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Pádel', 'Voleibol'];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Estado de datos
  const [data, setData] = useState({ upcoming: [], recent: [], scorers: [] });
  const [loading, setLoading] = useState(false);

  // Categoría actual basada en el índice
  const currentCategory = categorias[currentIndex];

  // 3. Efecto de Reloj (Timer para cambiar de deporte)
  useEffect(() => {
    let interval;
    if (!isPaused) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % categorias.length);
      }, 8000); // CAMBIA CADA 8 SEGUNDOS
    }
    return () => clearInterval(interval);
  }, [isPaused, categorias.length]);

  // 4. Carga de datos cada vez que cambia la categoría
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get(`/api/partidos/proximos?categoria=${currentCategory}`),
          api.get(`/api/partidos/recientes?categoria=${currentCategory}`),
          api.get(`/api/partidos/stats/top-players?categoria=${currentCategory}`)
        ]);
        
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          scorers: scRes.data.goleadores || []
        });
      } catch (error) {
        console.error("Error cargando datos", error);
        setData({ upcoming: [], recent: [], scorers: [] });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentCategory]);

  // Animaciones
  const variants = {
    enter: { opacity: 0, x: 100 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div>
      {/* HERO BANNER FIJO */}
      <div className="hero-section" style={{
        marginBottom: '30px',
        height: '50vh', // Un poco más chico para dar protagonismo a los datos
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), var(--bg-dark)), url('${bgImage}')`
      }}>
        <div className="hero-content">
          <p style={{color:'var(--gold)', letterSpacing:'2px', fontWeight:'bold'}}>{heroSubtitle}</p>
          <h1 style={{fontSize:'3.5rem', margin:'10px 0'}}>{heroTitle}</h1>
        </div>
      </div>

      {/* ÁREA DEL CARRUSEL DINÁMICO */}
      <div 
        className="main-container" 
        onMouseEnter={() => setIsPaused(true)} // Pausa al pasar el mouse
        onMouseLeave={() => setIsPaused(false)}
      >
        
        {/* Barra de Título del Deporte Actual */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', borderBottom:'1px solid #333', paddingBottom:'10px'}}>
          <h2 style={{margin:0, fontSize:'2rem', color:'white'}}>
            Resumen de <span style={{color:'var(--gold)'}}>{currentCategory}</span>
          </h2>
          
          {/* Indicadores de puntitos */}
          <div style={{display:'flex', gap:'10px'}}>
            {categorias.map((cat, idx) => (
              <div 
                key={cat} 
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '12px', height: '12px', borderRadius: '50%', cursor:'pointer',
                  backgroundColor: idx === currentIndex ? 'var(--gold)' : '#333',
                  transition: '0.3s'
                }}
                title={cat}
              />
            ))}
          </div>
        </div>

        {/* Contenido Animado */}
        <div style={{minHeight: '400px', position: 'relative'}}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentCategory} // La clave hace que React detecte el cambio y anime
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5 }}
              style={{width: '100%'}}
            >
              {loading ? (
                <div style={{textAlign:'center', padding:'50px', color:'#666'}}>Cargando datos de {currentCategory}...</div>
              ) : (
                <div className="dashboard-grid">
                  
                  {/* Columna Izquierda */}
                  <div style={{display:'flex', flexDirection:'column', gap:'30px'}}>
                    <div>
                      <h3 style={{color:'#fff', borderLeft:'4px solid var(--gold)', paddingLeft:'10px'}}>📅 Próximos Partidos</h3>
                      <UpcomingMatchesWidget matches={data.upcoming} />
                    </div>
                    <div>
                      <h3 style={{color:'#fff', borderLeft:'4px solid #4ade80', paddingLeft:'10px'}}>📊 Resultados</h3>
                      <RecentMatchesWidget matches={data.recent} />
                    </div>
                  </div>

                  {/* Columna Derecha */}
                  <div>
                    <h3 style={{color:'#fff', borderLeft:'4px solid var(--gold)', paddingLeft:'10px'}}>🏆 Líderes</h3>
                    <TopScorersWidget scorers={data.scorers} />
                    
                    {/* Widget Info Extra */}
                    <div className="widget" style={{marginTop: '20px', background: 'linear-gradient(45deg, #111, #222)'}}>
                       <small style={{color:'var(--gold)', fontWeight:'bold'}}>NOTA:</small>
                       <p style={{fontSize:'0.9rem', color:'#aaa', margin:'5px 0'}}>
                         Mostrando estadísticas en tiempo real para la liga de {currentCategory}.
                       </p>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default HomePage;