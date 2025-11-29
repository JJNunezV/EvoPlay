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

  // --- CONFIGURACIÓN VISUAL (Con valores por defecto si no hay nada en el Admin) ---
  const safeConfig = customConfig || {};
  
  const heroTitle = safeConfig.hero?.titulo || 'EVOPLAY LEAGUE';
  const heroSubtitle = safeConfig.hero?.subtitulo || 'TORNEO OFICIAL';
  // Esta es la foto por defecto (Estadio), pero si la cambias en el Admin, cambiará aquí.
  const bgImage = safeConfig.hero?.imagenFondo || 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2831';

  // --- CARGA DE DATOS REALES ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [upRes, recRes, scRes] = await Promise.all([
          api.get('/api/partidos/proximos'),
          api.get('/api/partidos/recientes'),
          api.get('/api/partidos/stats/top-players')
        ]);
        
        setData({
          upcoming: Array.isArray(upRes.data) ? upRes.data : [],
          recent: Array.isArray(recRes.data) ? recRes.data : [],
          scorers: scRes.data.goleadores && Array.isArray(scRes.data.goleadores) ? scRes.data.goleadores : []
        });
      } catch (error) {
        console.error("Error cargando datos", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{height:'80vh', display:'flex', justifyContent:'center', alignItems:'center', color:'var(--gold)'}}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  return (
    <div>
      {/* --- 1. HERO BANNER (La Foto Gigante) --- */}
      <div className="hero-section" style={{
        height: '70vh', // Altura del banner
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        marginBottom: '50px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // Capa oscura sobre la imagen para que el texto resalte
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), var(--bg-dark)), url('${bgImage}')`
      }}>
        <div className="hero-content" style={{zIndex: 2, padding: '20px'}}>
          <p style={{
            color: 'var(--gold)', 
            letterSpacing: '4px', 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            marginBottom: '10px',
            textTransform: 'uppercase'
          }}>
            {heroSubtitle}
          </p>
          <h1 style={{
            fontSize: '4.5rem', 
            margin: '0', 
            color: 'white', 
            textShadow: '0 4px 15px rgba(0,0,0,0.8)',
            fontFamily: 'Oswald, sans-serif'
          }}>
            {heroTitle}
          </h1>
        </div>
      </div>

      {/* --- 2. CONTENIDO (Partidos y Goleadores) --- */}
      <div className="main-container" style={{maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px'}}>
        <div className="dashboard-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px'}}>
          
          {/* Columna Izquierda */}
          <div style={{display:'flex', flexDirection:'column', gap:'40px'}}>
            
            {/* Widget Próximos */}
            <div>
               <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'15px', marginBottom:'20px', color:'white'}}>
                 🔥 Próximos Encuentros
               </h2>
               <UpcomingMatchesWidget matches={data.upcoming} />
            </div>

            {/* Widget Resultados */}
            <div>
               <h2 style={{borderLeft:'4px solid #4ade80', paddingLeft:'15px', marginBottom:'20px', color:'white'}}>
                 📊 Resultados Recientes
               </h2>
               <RecentMatchesWidget matches={data.recent} />
            </div>

          </div>

          {/* Columna Derecha */}
          <div>
            {/* Widget Goleadores */}
            <div>
               <h2 style={{borderLeft:'4px solid var(--gold)', paddingLeft:'15px', marginBottom:'20px', color:'white'}}>
                 🏆 Goleadores
               </h2>
               <TopScorersWidget scorers={data.scorers} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;