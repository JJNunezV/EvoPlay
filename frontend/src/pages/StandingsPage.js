import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [categoria, setCategoria] = useState('Fútbol 7');
  const [standings, setStandings] = useState([]);
  const [fairPlay, setFairPlay] = useState([]);
  const [sanciones, setSanciones] = useState([]);

  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  // ¿Es un deporte de sets? (Sin empates)
  const esDeporteSets = ['Voleibol', 'Pádel', 'Tenis'].includes(categoria);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pedimos las 3 tablas filtradas por la categoría actual
        const [resStandings, resFairPlay, resSanciones] = await Promise.all([
          api.get(`/api/partidos/standings?categoria=${categoria}`),
          api.get(`/api/partidos/cards?categoria=${categoria}`),
          api.get(`/api/partidos/sanciones?categoria=${categoria}`)
        ]);
        
        setStandings(resStandings.data);
        setFairPlay(resFairPlay.data);
        setSanciones(resSanciones.data);
      } catch (error) { console.error("Error", error); }
    };
    fetchData();
  }, [categoria]);

  return (
    <div style={{paddingBottom: '50px', maxWidth:'1200px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', fontSize:'2.5rem', marginBottom:'30px', color:'white'}}>ESTADÍSTICAS DEL TORNEO</h1>

      {/* --- SELECTOR DE LIGA --- */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'40px', gap:'10px', flexWrap:'wrap'}}>
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

      {/* --- 1. TABLA GENERAL --- */}
      <div className="table-card">
        <div className="table-header header-gold">
          <span>🏆</span> Tabla General - {categoria}
        </div>
        <div style={{overflowX:'auto'}}>
          <table className="pro-table">
            <thead>
              <tr>
                <th style={{width:'50px'}}>#</th>
                <th style={{textAlign:'left'}}>Equipo</th>
                <th>PJ</th>
                <th>G</th>
                {!esDeporteSets && <th>E</th>}
                <th>P</th>
                <th>{esDeporteSets ? 'SF' : 'GF'}</th>
                <th>{esDeporteSets ? 'SC' : 'GC'}</th>
                <th>{esDeporteSets ? 'Diff' : 'DG'}</th>
                <th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.length === 0 && <tr><td colSpan="10" style={{textAlign:'center', padding:'30px', color:'#666'}}>No hay datos registrados.</td></tr>}
              {standings.map((team, i) => (
                <tr key={i}>
                  <td><div className="rank-badge">{i+1}</div></td>
                  <td className="team-name-cell">
                    {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt=""/>}
                    <Link to={`/equipos/${team._id}`} style={{color:'white'}}>{team.nombre}</Link>
                  </td>
                  <td>{team.PJ}</td>
                  <td style={{color:'#4ade80'}}>{team.PG}</td>
                  {!esDeporteSets && <td>{team.PE}</td>}
                  <td style={{color:'#f87171'}}>{team.PP}</td>
                  <td>{team.GF}</td>
                  <td>{team.GC}</td>
                  <td>{team.GF - team.GC}</td>
                  <td className="points-cell">{team.PTS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRID PARA LAS OTRAS DOS TABLAS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(450px, 1fr))', gap:'40px'}}>
        
        {/* --- 2. TRIBUNAL DISCIPLINARIO (Lista de Sanciones) --- */}
        <div className="table-card" style={{borderTop:'3px solid #ef4444'}}>
          <div className="table-header" style={{color:'#fca5a5', borderLeft:'5px solid #ef4444'}}>
            <span>⚖️</span> Tribunal Disciplinario
          </div>
          <table className="pro-table">
            <thead><tr><th style={{textAlign:'left', paddingLeft:'20px'}}>Jugador / Motivo</th><th style={{textAlign:'center'}}>Sanción</th></tr></thead>
            <tbody>
              {sanciones.length === 0 && <tr><td colSpan="2" style={{padding:'30px', textAlign:'center', color:'#666'}}>Juego limpio, sin sanciones recientes.</td></tr>}
              {sanciones.map((s, i) => (
                <tr key={i}>
                  <td style={{paddingLeft:'20px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        {s.logo && <img src={s.logo} width="25" style={{borderRadius:'50%'}} alt="" />}
                        <div>
                            <div style={{fontWeight:'bold', color:'white'}}>{s.jugador}</div>
                            <div style={{fontSize:'0.8rem', color:'#fca5a5', fontStyle:'italic'}}>"{s.motivo}"</div>
                            <div style={{fontSize:'0.7rem', color:'#666'}}>{new Date(s.fecha).toLocaleDateString()}</div>
                        </div>
                    </div>
                  </td>
                  <td style={{textAlign:'center'}}>
                    <span className={`card-tag ${s.tipo === 'Amarilla' ? 'tag-yellow' : 'tag-red'}`}>
                      {s.tipo.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- 3. FAIR PLAY (Puntos por Equipo) --- */}
        <div className="table-card" style={{borderTop:'3px solid #facc15'}}>
          <div className="table-header" style={{color:'#fde047', borderLeft:'5px solid #facc15'}}>
            <span>🤝</span> Fair Play
          </div>
          <table className="pro-table">
            <thead><tr><th style={{textAlign:'left', paddingLeft:'20px'}}>Club</th><th style={{color:'#facc15'}}>🟨</th><th style={{color:'#ef4444'}}>🟥</th><th>Pts Neg.</th></tr></thead>
            <tbody>
              {fairPlay.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#666'}}>Sin registros.</td></tr>}
              {fairPlay.map((team, i) => (
                <tr key={i}>
                  <td className="team-name-cell" style={{paddingLeft:'20px'}}>
                    {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                    {team.nombre}
                  </td>
                  <td style={{textAlign:'center', fontWeight:'bold', color:'#facc15'}}>{team.amarillas}</td>
                  <td style={{textAlign:'center', fontWeight:'bold', color:'#ef4444'}}>{team.rojas}</td>
                  <td style={{textAlign:'center', fontWeight:'800'}}>{team.total}</td>
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