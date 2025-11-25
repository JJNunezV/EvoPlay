import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [standings, setStandings] = useState([]);
  const [fairPlay, setFairPlay] = useState([]);
  const [sanciones, setSanciones] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pedimos las 3 tablas al mismo tiempo
        const [resStandings, resFairPlay, resSanciones] = await Promise.all([
          api.get('/api/partidos/standings'),
          api.get('/api/partidos/cards'),
          api.get('/api/partidos/sanciones')
        ]);
        
        setStandings(resStandings.data);
        setFairPlay(resFairPlay.data);
        setSanciones(resSanciones.data);
      } catch (error) {
        console.error("Error cargando tablas", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{paddingBottom: '50px'}}>
      <h1 style={{textAlign:'center', marginBottom:'40px'}}>Estadísticas del Torneo</h1>

      {/* --- 1. TABLA GENERAL --- */}
      <div className="table-container" style={{marginBottom: '50px'}}>
        <div style={{padding:'15px', background:'#1a1a1a', borderBottom:'2px solid var(--gold)'}}>
          <h2 style={{margin:0, fontSize:'1.5rem', color:'white'}}>🏆 Tabla General</h2>
        </div>
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th style={{textAlign:'left'}}>Club</th>
              <th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <tr key={i}>
                <td>{i+1}</td>
                <td style={{textAlign:'left', display:'flex', alignItems:'center', gap:'10px'}}>
                  {team.logoUrl && <img src={team.logoUrl} alt="logo" width="30" height="30" style={{objectFit:'contain'}} />}
                  <Link to={`/equipos/${team._id}`} style={{color:'white', fontWeight:'bold'}}>{team.nombre}</Link>
                </td>
                <td>{team.PJ}</td><td>{team.PG}</td><td>{team.PE}</td><td>{team.PP}</td>
                <td>{team.GF}</td><td>{team.GC}</td>
                <td style={{color:'var(--gold)', fontWeight:'bold', fontSize:'1.2rem'}}>{team.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:'30px'}}>
        
        {/* --- 2. TRIBUNAL DISCIPLINARIO (Sanciones) --- */}
        <div className="table-container" style={{border:'1px solid #ef4444'}}>
          <div style={{padding:'15px', background:'#3f1a1a', borderBottom:'2px solid #ef4444'}}>
            <h2 style={{margin:0, fontSize:'1.3rem', color:'#fca5a5'}}>⚖️ Tribunal Disciplinario</h2>
          </div>
          <table className="standings-table">
            <thead>
              <tr><th style={{textAlign:'left'}}>Jugador</th><th>Sanción</th><th>Motivo</th></tr>
            </thead>
            <tbody>
              {sanciones.length === 0 && <tr><td colSpan="3" style={{padding:'20px', color:'#888'}}>Juego limpio, sin sanciones recientes.</td></tr>}
              {sanciones.map((s, i) => (
                <tr key={i}>
                  <td style={{textAlign:'left'}}>
                    <div style={{fontWeight:'bold'}}>{s.jugador}</div>
                    <div style={{fontSize:'0.8rem', color:'#888'}}>{s.equipo}</div>
                  </td>
                  <td>
                    <span style={{
                      background: s.tipo === 'Amarilla' ? '#facc15' : '#ef4444',
                      color: 'black', padding:'4px 8px', borderRadius:'4px', fontWeight:'bold', fontSize:'0.8rem'
                    }}>
                      {s.tipo === 'Amarilla' ? 'AMARILLA' : 'ROJA'}
                    </span>
                  </td>
                  <td style={{fontStyle:'italic', color:'#ccc'}}>{s.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- 3. FAIR PLAY (Puntos por Equipo) --- */}
        <div className="table-container" style={{border:'1px solid #facc15'}}>
          <div style={{padding:'15px', background:'#222', borderBottom:'2px solid #facc15'}}>
            <h2 style={{margin:0, fontSize:'1.3rem', color:'#facc15'}}>🤝 Fair Play</h2>
          </div>
          <table className="standings-table">
            <thead>
              <tr><th style={{textAlign:'left'}}>Club</th><th>🟨</th><th>🟥</th><th>Pts Negativos</th></tr>
            </thead>
            <tbody>
              {fairPlay.map((team, i) => (
                <tr key={i}>
                  <td style={{textAlign:'left', display:'flex', alignItems:'center', gap:'10px'}}>
                    {team.logoUrl && <img src={team.logoUrl} width="25" alt="" />}
                    {team.nombre}
                  </td>
                  <td style={{color:'#facc15', fontWeight:'bold'}}>{team.amarillas}</td>
                  <td style={{color:'#ef4444', fontWeight:'bold'}}>{team.rojas}</td>
                  <td style={{fontWeight:'bold'}}>{team.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default StandingsPage;