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
      // Ordenamos: los más recientes primero
      const ordenados = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMatches(ordenados);
    } catch (error) { console.error("Error", error); }
  };

  useEffect(() => { fetchMatches(); }, []);

  // Filtramos las listas
  const programados = matches.filter(m => !m.finalizado);
  const finalizados = matches.filter(m => m.finalizado);

  const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div style={{display: 'flex', gap: '20px', flexDirection: 'column'}}>
      <h1>⚽ Centro de Partidos</h1>

      {/* PANEL DE ADMIN: Crear o Jugar */}
      {isAdmin && (
        <div style={{marginBottom: '20px'}}>
          <CreateMatchForm 
            onMatchCreated={() => { fetchMatches(); setMatchToPlay(null); }} 
            matchToPlay={matchToPlay}
            onCancel={() => setMatchToPlay(null)}
          />
        </div>
      )}

      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        
        {/* COLUMNA IZQUIERDA: PROGRAMADOS */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{borderBottom: '3px solid #ffc107', display:'inline-block'}}>📅 Próximos Encuentros</h2>
          {programados.length === 0 && <p>No hay partidos programados.</p>}
          {programados.map(m => (
            <div key={m._id} style={{background: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '10px', border:'1px solid #ffeeba'}}>
              <div style={{fontWeight: 'bold', marginBottom: '5px', textTransform:'uppercase', fontSize:'0.8rem', color:'#856404'}}>{formatearFecha(m.fecha)}</div>
              <div style={{fontSize: '1.2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>{m.equipoLocal.nombre}</span>
                <span style={{color:'#888', fontSize:'0.9rem'}}>vs</span>
                <span>{m.equipoVisitante.nombre}</span>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => { setMatchToPlay(m); window.scrollTo({top:0, behavior:'smooth'}); }}
                  style={{marginTop: '10px', width: '100%', padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold'}}
                >
                  ▶️ Jugar Ahora
                </button>
              )}
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{borderBottom: '3px solid #28a745', display:'inline-block'}}>✅ Resultados Finales</h2>
          {finalizados.length === 0 && <p>Aún no hay resultados.</p>}
          {finalizados.map(m => (
            <div key={m._id} style={{background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '10px', border:'1px solid #ddd', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
              <div style={{color:'#777', fontSize:'0.8rem', marginBottom:'5px'}}>{formatearFecha(m.fecha)}</div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight:'bold'}}>
                <span style={{flex:1, textAlign:'right'}}>{m.equipoLocal.nombre}</span>
                <span style={{background:'#333', color:'#fff', padding:'5px 15px', borderRadius:'10px', margin:'0 10px'}}>
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