import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [categoria, setCategoria] = useState('Fútbol 7');
  const [data, setData] = useState({ standings: [], fairPlay: [], sancione: [] });
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];
  const esDeporteSets = ['Voleibol', 'Pádel'].includes(categoria);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStand, resCards, resSan] = await Promise.all([
          api.get(`/api/partidos/standings?categoria=${categoria}`),
          api.get(`/api/partidos/cards?categoria=${categoria}`),
          api.get(`/api/partidos/sanciones?categoria=${categoria}`)
        ]);
        setData({ standings: resStand.data, fairPlay: resCards.data, sancione: resSan.data });
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [categoria]);

  return (
    <div style={{paddingBottom: '50px'}}>
      <h1 style={{textAlign:'center', color:'white'}}>Estadísticas</h1>
      <div style={{display:'flex', justifyContent:'center', marginBottom:'30px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} style={{background: categoria===cat?'var(--gold)':'#222', color: categoria===cat?'black':'white', border:'1px solid #444', padding:'8px 15px', borderRadius:'20px', cursor:'pointer'}}>
            {cat}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header header-gold">🏆 Tabla General - {categoria}</div>
        <table className="pro-table">
          <thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th>{!esDeporteSets && <th>E</th>}<th>P</th><th>PTS</th></tr></thead>
          <tbody>
            {data.standings.map((t, i) => (
              <tr key={i}>
                <td>{i+1}</td>
                <td className="team-name-cell"><Link to={`/equipos/${t._id}`} style={{color:'white'}}>{t.nombre}</Link></td>
                <td>{t.PJ}</td><td>{t.PG}</td>{!esDeporteSets && <td>{t.PE}</td>}<td>{t.PP}</td>
                <td className="points-cell">{t.PTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default StandingsPage;