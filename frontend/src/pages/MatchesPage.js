import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [matchToPlay, setMatchToPlay] = useState(null);
  const isAdmin = !!localStorage.getItem('token');

  const fetchMatches = async () => {
    try {
      const response = await api.get('/api/partidos');
      const ordenados = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMatches(ordenados);
    } catch (error) { console.error("Error", error); }
  };

  useEffect(() => { fetchMatches(); }, []);

  const programados = matches.filter(m => !m.finalizado);
  const finalizados = matches.filter(m => m.finalizado);

  const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div style={{display: 'flex', gap: '30px', flexDirection: 'column', paddingBottom: '50px'}}>
      <h1 style={{borderBottom: '1px solid #333', paddingBottom: '10px'}}>⚽ Centro de Partidos</h1>

      {/* PANEL DE ADMIN */}
      {isAdmin && (
        <div style={{marginBottom: '30px'}}>
          <CreateMatchForm 
            onMatchCreated={() => { fetchMatches(); setMatchToPlay(null); }} 
            matchToPlay={matchToPlay}
            onCancel={() => setMatchToPlay(null)}
          />
        </div>
      )}

      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        
        {/* COLUMNA IZQUIERDA: PROGRAMADOS (Fondo Oscuro con Borde Dorado) */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color: '#e6c88b', borderBottom: '2px solid #e6c88b', display:'inline-block', marginBottom:'20px'}}>📅 Próximos Encuentros</h2>
          
          {programados.length === 0 && <p style={{color: '#777'}}>No hay partidos programados.</p>}
          
          {programados.map(m => (
            <div key={m._id} style={{
              background: '#1a1a1a', /* Fondo Oscuro */
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '15px', 
              border: '1px solid #c5a059', /* Borde Dorado */
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              <div style={{color: '#e6c88b', fontWeight: 'bold', marginBottom: '10px', textTransform:'uppercase', fontSize:'0.85rem'}}>
                {formatearFecha(m.fecha)}
              </div>
              
              <div style={{fontSize: '1.3rem', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white'}}>
                <span style={{flex:1, textAlign:'right'}}>{m.equipoLocal.nombre}</span>
                <span style={{color:'#888', margin:'0 15px', fontSize:'1rem'}}>vs</span>
                <span style={{flex:1, textAlign:'left'}}>{m.equipoVisitante.nombre}</span>
              </div>

              {isAdmin && (
                <button 
                  onClick={() => { setMatchToPlay(m); window.scrollTo({top:0, behavior:'smooth'}); }}
                  style={{marginTop: '15px', width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'bold'}}
                >
                  ▶️ Jugar Ahora
                </button>
              )}
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: RESULTADOS (Fondo Oscuro con Borde Gris) */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color: '#fff', borderBottom: '2px solid #fff', display:'inline-block', marginBottom:'20px'}}>✅ Resultados Finales</h2>
          
          {finalizados.length === 0 && <p style={{color: '#777'}}>Aún no hay resultados.</p>}
          
          {finalizados.map(m => (
            <div key={m._id} style={{
              background: '#121212', /* Fondo Muy Oscuro */
              padding: '20px', 
              borderRadius: '12px', 
              marginBottom: '15px', 
              border: '1px solid #333', /* Borde sutil */
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              <div style={{color: '#777', fontSize:'0.8rem', marginBottom:'10px'}}>{formatearFecha(m.fecha)}</div>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight:'bold', color:'white'}}>
                <span style={{flex:1, textAlign:'right'}}>{m.equipoLocal.nombre}</span>
                
                <span style={{background:'#000', color:'#c5a059', padding:'8px 20px', borderRadius:'8px', margin:'0 15px', border:'1px solid #333'}}>
                  {m.golesLocal} - {m.golesVisitante}
                </span>
                
                <span style={{flex:1, textAlign:'left'}}>{m.equipoVisitante.nombre}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default MatchesPage;