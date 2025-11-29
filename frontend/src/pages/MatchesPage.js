import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [matchToPlay, setMatchToPlay] = useState(null);
  const isAdmin = !!localStorage.getItem('token');

  const [categoria, setCategoria] = useState('Fútbol 7');
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  const fetchMatches = async () => {
    try {
      const response = await api.get(`/api/partidos?categoria=${categoria}`);
      const ordenados = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMatches(ordenados);
    } catch (error) { console.error("Error", error); }
  };

  useEffect(() => { fetchMatches(); }, [categoria]);

  const programados = matches.filter(m => !m.finalizado);
  const finalizados = matches.filter(m => m.finalizado);

  const formatearFecha = (f) => {
    try {
      return new Date(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase();
    } catch (e) { return f; }
  };

  const esDeporteSets = ['Voleibol', 'Pádel', 'Tenis'].includes(categoria);

  return (
    <div style={{display: 'flex', gap: '20px', flexDirection: 'column', paddingBottom:'50px'}}>
      <h1 style={{textAlign:'center', color:'white'}}>⚽ Centro de Partidos</h1>

      {/* BOTONES DE CATEGORÍA */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'20px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              background: categoria === cat ? 'var(--gold)' : '#222',
              color: categoria === cat ? 'black' : 'white',
              border: '1px solid #444',
              padding: '10px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.3s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PANEL DE ADMIN */}
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
        
        {/* COLUMNA IZQUIERDA: PROGRAMADOS (Fondo Oscuro + Borde Dorado) */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{borderBottom: '3px solid var(--gold)', display:'inline-block', color:'var(--gold)'}}>📅 Próximos Encuentros</h2>
          
          {programados.length === 0 && <p style={{color:'#666'}}>No hay partidos programados.</p>}
          
          {programados.map(m => (
            <div key={m._id} style={{
                background: '#1a1a1a', /* Fondo Oscuro */
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '15px', 
                border: '1px solid var(--gold)', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              <div style={{fontWeight: 'bold', marginBottom: '10px', fontSize:'0.8rem', color:'var(--gold)', textTransform:'uppercase'}}>
                {formatearFecha(m.fecha)}
              </div>
              <div style={{fontSize: '1.2rem', display:'flex', justifyContent:'space-between', alignItems:'center', color:'white'}}>
                <span style={{flex:1, textAlign:'right'}}>{m.equipoLocal.nombre}</span>
                <span style={{color:'#666', fontSize:'0.9rem', margin:'0 10px'}}>vs</span>
                <span style={{flex:1, textAlign:'left'}}>{m.equipoVisitante.nombre}</span>
              </div>
              
              {isAdmin && (
                <button 
                  onClick={() => { setMatchToPlay(m); window.scrollTo({top:0, behavior:'smooth'}); }}
                  style={{marginTop: '15px', width: '100%', padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold'}}
                >
                  ▶️ Jugar Ahora
                </button>
              )}
            </div>
          ))}
        </div>

        {/* COLUMNA DERECHA: RESULTADOS (Fondo Oscuro + Borde Verde) */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{borderBottom: '3px solid #4ade80', display:'inline-block', color:'#4ade80'}}>✅ Resultados Finales</h2>
          
          {finalizados.length === 0 && <p style={{color:'#666'}}>Aún no hay resultados.</p>}
          
          {finalizados.map(m => (
            <div key={m._id} style={{
                background: '#121212', /* Fondo Muy Oscuro */
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '15px', 
                border: '1px solid #333', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
              <div style={{color:'#777', fontSize:'0.8rem', marginBottom:'10px', textTransform:'uppercase'}}>
                {formatearFecha(m.fecha)}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight:'bold', color:'white'}}>
                <span style={{flex:1, textAlign:'right'}}>{m.equipoLocal.nombre}</span>
                
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', margin:'0 15px'}}>
                  <span style={{background:'#000', color:'var(--gold)', padding:'5px 15px', borderRadius:'8px', border:'1px solid #333'}}>
                    {m.golesLocal} - {m.golesVisitante}
                  </span>
                  {esDeporteSets && <small style={{fontSize:'0.6rem', color:'#666', marginTop:'4px'}}>SETS</small>}
                </div>
                
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