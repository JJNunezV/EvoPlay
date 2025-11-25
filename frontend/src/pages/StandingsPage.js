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
        const [resStandings, resFairPlay, resSanciones] = await Promise.all([
          api.get('/api/partidos/standings'),
          api.get('/api/partidos/cards'),
          api.get('/api/partidos/sanciones') // La nueva lista detallada
        ]);
        setStandings(resStandings.data);
        setFairPlay(resFairPlay.data);
        setSanciones(resSanciones.data);
      } catch (error) { console.error("Error", error); }
    };
    fetchData();
  }, []);

  return (
    <div style={{paddingBottom: '50px'}}>
      <h1>Estadísticas del Torneo</h1>

      {/* TABLA GENERAL */}
      <div className="table-container">
        <div style={{padding:'15px', background:'#111', borderBottom:'1px solid #333'}}>
          <h2 style={{margin:0, fontSize:'1.2rem', color:'white'}}>🏆 Tabla General</h2>
        </div>
        <table className="pro-table">
          <thead><tr><th>#</th><th style={{textAlign:'left'}}>Club</th><th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>PTS</th></tr></thead>
          <tbody>
            {standings.map((team, i) => (
              <tr key={i}>
                <td>{i+1}</td>
                <td className="team-name-cell">
                  {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                  <Link to={`/equipos/${team._id}`} style={{color:'white'}}>{team.nombre}</Link>
                </td>
                <td>{team.PJ}</td><td>{team.PG}</td><td>{team.PE}</td><td>{team.PP}</td><td>{team.GF}</td><td>{team.GC}</td>
                <td style={{color:'var(--gold)', fontWeight:'bold', fontSize:'1.1rem'}}>{team.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:'30px'}}>
        
        {/* TRIBUNAL DISCIPLINARIO (Lista Detallada) */}
        <div className="table-container" style={{borderColor:'#ef4444'}}>
          <div style={{padding:'15px', background:'#3f1a1a', borderBottom:'1px solid #ef4444'}}>
            <h2 style={{margin:0, fontSize:'1.2rem', color:'#fca5a5'}}>⚖️ Tribunal Disciplinario</h2>
          </div>
          <table className="pro-table">
            <thead><tr><th style={{textAlign:'left'}}>Jugador</th><th>Sanción</th><th>Motivo</th></tr></thead>
            <tbody>
              {sanciones.length === 0 && <tr><td colSpan="3">Juego limpio, sin sanciones.</td></tr>}
              {sanciones.map((s, i) => (
                <tr key={i}>
                  <td className="team-name-cell">
                    {s.logo && <img src={s.logo} className="team-logo-mini" alt="" />}
                    <div>
                      <div>{s.jugador}</div>
                      <small style={{color:'#888'}}>{s.equipo}</small>
                    </div>
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

        {/* TABLA FAIR PLAY (Resumen) */}
        <div className="table-container">
          <div style={{padding:'15px', background:'#111', borderBottom:'1px solid #333'}}>
            <h2 style={{margin:0, fontSize:'1.2rem', color:'white'}}>🤝 Fair Play (Por Equipo)</h2>
          </div>
          <table className="pro-table">
            <thead><tr><th style={{textAlign:'left'}}>Club</th><th>🟨</th><th>🟥</th><th>Puntos</th></tr></thead>
            <tbody>
              {fairPlay.map((team, i) => (
                <tr key={i}>
                  <td className="team-name-cell">
                    {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                    {team.nombre}
                  </td>
                  <td style={{color:'#facc15', fontWeight:'bold'}}>{team.amarillas}</td>
                  <td style={{color:'#ef4444', fontWeight:'bold'}}>{team.rojas}</td>
                  <td>{team.total}</td>
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