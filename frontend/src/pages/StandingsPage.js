import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [categoria, setCategoria] = useState('Fútbol 7');
  const [standings, setStandings] = useState([]);

  // Categorías disponibles
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/partidos/standings?categoria=${categoria}`);
        setStandings(res.data);
      } catch (error) { console.error("Error", error); }
    };
    fetchData();
  }, [categoria]);

  // Determinar si el deporte tiene empates
  const tieneEmpate = !['Voleibol', 'Pádel', 'Tenis'].includes(categoria);

  return (
    <div style={{paddingBottom: '50px', maxWidth:'1200px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', fontSize:'2.5rem', marginBottom:'30px', color:'var(--gold)'}}>ESTADÍSTICAS</h1>

      {/* SELECTOR DE CATEGORÍA */}
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
              fontWeight: 'bold'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TABLA GENERAL ADAPTABLE */}
      <div className="table-card">
        <div className="table-header header-gold">
          <span>🏆</span> Tabla General - {categoria}
        </div>
        <table className="pro-table">
          <thead>
            <tr>
              <th style={{width:'50px'}}>#</th>
              <th style={{textAlign:'left'}}>Equipo</th>
              <th>PJ</th>
              <th>G</th>
              {tieneEmpate && <th>E</th>} {/* Solo si aplica */}
              <th>P</th>
              {tieneEmpate ? <th>Diff</th> : <th>Sets/Puntos</th>}
              <th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding:'30px', color:'#666'}}>No hay datos registrados para esta categoría.</td></tr>}
            
            {standings.map((team, i) => (
              <tr key={i}>
                <td><div className="rank-badge">{i+1}</div></td>
                <td className="team-name-cell">
                  {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                  <Link to={`/equipos/${team._id}`} style={{color:'white'}}>{team.nombre}</Link>
                </td>
                <td>{team.PJ}</td>
                <td style={{color:'#4ade80'}}>{team.PG}</td>
                {tieneEmpate && <td>{team.PE}</td>}
                <td style={{color:'#f87171'}}>{team.PP}</td>
                {/* Diferencia de goles o sets */}
                <td>{tieneEmpate ? (team.GF - team.GC) : `${team.GF}-${team.GC}`}</td>
                <td className="points-cell">{team.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StandingsPage;