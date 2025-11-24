import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [standings, setStandings] = useState([]);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStandings, resCards] = await Promise.all([
          api.get('/api/partidos/standings'),
          api.get('/api/partidos/cards') // Pedimos la nueva tabla
        ]);
        setStandings(resStandings.data);
        setCards(resCards.data);
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
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>Club</th>
              <th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>GF</th><th>GC</th><th>PTS</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team, i) => (
              <tr key={i}>
                <td className="team-name-cell">
                  <span style={{color:'#666', width:'20px'}}>{i+1}</span>
                  {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                  <Link to={`/equipos/${team._id}`} style={{color:'white'}}>{team.nombre}</Link>
                </td>
                <td>{team.PJ}</td><td>{team.PG}</td><td>{team.PE}</td><td>{team.PP}</td>
                <td>{team.GF}</td><td>{team.GC}</td>
                <td style={{color:'var(--gold)', fontWeight:'bold', fontSize:'1.1rem'}}>{team.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TABLA DISCIPLINARIA */}
      <div className="table-container">
        <div style={{padding:'15px', background:'#111', borderBottom:'1px solid #333'}}>
          <h2 style={{margin:0, fontSize:'1.2rem', color:'white'}}>⚖️ Tabla Disciplinaria (Fair Play)</h2>
        </div>
        <table className="pro-table">
          <thead>
            <tr>
              <th style={{textAlign:'left'}}>Club</th>
              <th>🟨 Amarillas</th>
              <th>🟥 Rojas</th>
              <th>Puntos Disc.</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((team, i) => (
              <tr key={i}>
                <td className="team-name-cell">
                  {team.logoUrl && <img src={team.logoUrl} className="team-logo-mini" alt="" />}
                  {team.nombre}
                </td>
                <td>{team.amarillas}</td>
                <td>{team.rojas}</td>
                <td style={{fontWeight:'bold'}}>{team.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default StandingsPage;