import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [matchToPlay, setMatchToPlay] = useState(null);
  const [categoria, setCategoria] = useState('Fútbol 7');
  const isAdmin = !!localStorage.getItem('token');
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  const fetchMatches = async () => {
    try {
      // USA LA RUTA CORRECTA CON /API
      const response = await api.get(`/api/partidos?categoria=${categoria}`);
      const ordenados = Array.isArray(response.data) ? response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) : [];
      setMatches(ordenados);
    } catch (error) { console.error("Error", error); setMatches([]); }
  };

  useEffect(() => { fetchMatches(); }, [categoria]);

  const programados = matches.filter(m => !m.finalizado);
  const finalizados = matches.filter(m => m.finalizado);
  const formatearFecha = (f) => new Date(f).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div style={{paddingBottom:'50px'}}>
      <h1 style={{textAlign:'center', color:'white'}}>Centro de Partidos</h1>
      
      {/* SELECTOR CATEGORÍA */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'20px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} 
            style={{background: categoria===cat?'var(--gold)':'#222', color: categoria===cat?'black':'white', border:'1px solid #444', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold'}}>
            {cat}
          </button>
        ))}
      </div>

      {isAdmin && (
        <div style={{marginBottom: '30px'}}>
          <CreateMatchForm 
            onMatchCreated={() => { fetchMatches(); setMatchToPlay(null); }} 
            matchToPlay={matchToPlay} 
            onCancel={() => setMatchToPlay(null)}
            defaultCategory={categoria} // Pasamos la categoría actual
          />
        </div>
      )}

      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        {/* Programados */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color:'var(--gold)', borderBottom:'2px solid var(--gold)'}}>📅 Próximos</h2>
          {programados.length === 0 && <p style={{color:'#666'}}>Sin partidos programados.</p>}
          {programados.map(m => (
            <div key={m._id} style={{background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '10px', border:'1px solid var(--gold)'}}>
              <div style={{color:'var(--gold)', fontSize:'0.8rem', textTransform:'uppercase', fontWeight:'bold'}}>{formatearFecha(m.fecha)}</div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'1.1rem', color:'white'}}>
                <span>{m.equipoLocal?.nombre}</span> <span style={{color:'#666', fontSize:'0.9rem'}}>vs</span> <span>{m.equipoVisitante?.nombre}</span>
              </div>
              {isAdmin && <button onClick={() => {setMatchToPlay(m); window.scrollTo({top:0, behavior:'smooth'});}} style={{marginTop:'10px', width:'100%', background:'#28a745', border:'none', padding:'8px', color:'white', cursor:'pointer', borderRadius:'4px'}}>▶️ Jugar Ahora</button>}
            </div>
          ))}
        </div>
        {/* Resultados */}
        <div style={{flex: 1, minWidth: '300px'}}>
          <h2 style={{color:'#4ade80', borderBottom:'2px solid #4ade80'}}>✅ Resultados</h2>
          {finalizados.length === 0 && <p style={{color:'#666'}}>Sin resultados.</p>}
          {finalizados.map(m => (
            <div key={m._id} style={{background: '#121212', padding: '15px', borderRadius: '8px', marginBottom: '10px', border:'1px solid #333'}}>
              <div style={{color:'#777', fontSize:'0.8rem'}}>{formatearFecha(m.fecha)}</div>
              <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', color:'white'}}>
                <span>{m.equipoLocal?.nombre}</span>
                <span style={{background:'#000', padding:'2px 10px', borderRadius:'5px', border:'1px solid #333', color:'var(--gold)'}}>{m.golesLocal} - {m.golesVisitante}</span>
                <span>{m.equipoVisitante?.nombre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MatchesPage;