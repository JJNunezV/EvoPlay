import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [categoria, setCategoria] = useState('Fútbol 7');
  const [data, setData] = useState({
    standings: [],
    fairPlay: [],
    sanciones: [],
    topScorers: [],
    topAssists: [],
    topKeepers: []
  });

  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];
  const esDeporteSets = ['Voleibol', 'Pádel', 'Tenis'].includes(categoria);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStand, resCards, resSan, resTop] = await Promise.all([
          api.get(`/api/partidos/standings?categoria=${categoria}`),
          api.get(`/api/partidos/cards?categoria=${categoria}`),
          api.get(`/api/partidos/sanciones?categoria=${categoria}`),
          api.get(`/api/partidos/stats/top-players?categoria=${categoria}`)
        ]);

        setData({
          standings: resStand.data,
          fairPlay: resCards.data,
          sanciones: resSan.data,
          topScorers: resTop.data.goleadores || [],
          topAssists: resTop.data.asistidores || [],
          topKeepers: resTop.data.porteros || []
        });
      } catch (error) { console.error("Error cargando tablas", error); }
    };
    fetchData();
  }, [categoria]);

  // Componente auxiliar para tablas pequeñas
  const MiniTable = ({ title, icon, list, valueKey, colorHeader }) => (
    <div className="table-card" style={{marginBottom:0}}>
      <div className="table-header" style={{borderLeft: `5px solid ${colorHeader}`, color: colorHeader, display:'flex', alignItems:'center', gap:'10px', padding:'15px', fontSize:'1.1rem', background:'rgba(0,0,0,0.2)'}}>
        <span>{icon}</span> {title}
      </div>
      <table className="pro-table">
        <thead><tr><th>#</th><th style={{textAlign:'left'}}>Jugador</th><th>Total</th></tr></thead>
        <tbody>
          {list.length === 0 && <tr><td colSpan="3" style={{color:'#666', textAlign:'center', padding:'20px'}}>Sin datos.</td></tr>}
          {list.map((p, i) => (
            <tr key={i}>
              <td><div className="rank-badge" style={{width:'25px', height:'25px', fontSize:'0.7rem'}}>{i+1}</div></td>
              <td className="team-name-cell">
                 {p.logo && <img src={p.logo} className="team-logo-mini" alt=""/>}
                 <div><div>{p.nombre}</div><small style={{color:'#888'}}>{p.equipo}</small></div>
              </td>
              <td className="points-cell" style={{fontSize:'1rem'}}>{p[valueKey] || p.porterias}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{paddingBottom: '80px', maxWidth:'1200px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', fontSize:'2.5rem', marginBottom:'30px', color:'white'}}>ESTADÍSTICAS</h1>

      {/* SELECTOR DE CATEGORÍA */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'40px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button key={cat} onClick={() => setCategoria(cat)} 
            style={{
              background: categoria===cat?'var(--gold)':'#222', 
              color: categoria===cat?'black':'white', 
              border:'1px solid #444', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', fontWeight:'bold', transition:'0.3s'
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* 1. TABLA GENERAL */}
      <div className="table-card">
        <div className="table-header header-gold"><span>🏆</span> Tabla General</div>
        <div style={{overflowX:'auto'}}>
          <table className="pro-table">
            <thead>
              <tr>
                <th>#</th><th style={{textAlign:'left'}}>Club</th>
                <th>PJ</th><th>G</th>{!esDeporteSets && <th>E</th>}<th>P</th>
                <th>{esDeporteSets?'SF':'GF'}</th><th>{esDeporteSets?'SC':'GC'}</th><th>Dif</th><th>PTS</th>
              </tr>
            </thead>
            <tbody>
              {data.standings.length === 0 && <tr><td colSpan="10" style={{textAlign:'center', padding:'30px', color:'#666'}}>No hay datos registrados.</td></tr>}
              {data.standings.map((t, i) => (
                <tr key={i}>
                  <td><div className="rank-badge">{i+1}</div></td>
                  <td className="team-name-cell">
                    {t.logoUrl && <img src={t.logoUrl} className="team-logo-mini" alt=""/>}
                    <Link to={`/equipos/${t._id}`} style={{color:'white'}}>{t.nombre}</Link>
                  </td>
                  <td>{t.PJ}</td><td style={{color:'#4ade80'}}>{t.PG}</td>{!esDeporteSets && <td>{t.PE}</td>}<td style={{color:'#f87171'}}>{t.PP}</td>
                  <td>{t.GF}</td><td>{t.GC}</td><td>{t.GF - t.GC}</td><td className="points-cell">{t.PTS}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. ESTADÍSTICAS INDIVIDUALES (Solo deportes con goles) */}
      {!esDeporteSets && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'20px', marginBottom:'40px'}}>
          <MiniTable title="Goleadores" icon="⚽" list={data.topScorers} valueKey="goles" colorHeader="#4ade80" />
          <MiniTable title="Asistencias" icon="👟" list={data.topAssists} valueKey="asistencias" colorHeader="#60a5fa" />
          <MiniTable title="Porterías a 0" icon="🧤" list={data.topKeepers} valueKey="porterias" colorHeader="#f472b6" />
        </div>
      )}

      {/* 3. DISCIPLINARIO Y FAIR PLAY */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(400px, 1fr))', gap:'30px'}}>
        
        {/* Sanciones */}
        <div className="table-card" style={{borderColor:'#ef4444'}}>
          <div className="table-header" style={{color:'#fca5a5', borderLeft:'5px solid #ef4444', background:'rgba(239, 68, 68, 0.1)'}}><span>⚖️</span> Sanciones</div>
          <table className="pro-table">
            <thead><tr><th style={{textAlign:'left'}}>Jugador</th><th>Sanción</th><th>Motivo</th></tr></thead>
            <tbody>
              {data.sanciones.length===0 && <tr><td colSpan="3" style={{textAlign:'center', color:'#666', padding:'20px'}}>Limpio.</td></tr>}
              {data.sanciones.map((s, i) => (
                <tr key={i}>
                  <td className="team-name-cell">
                    <div><div>{s.jugador}</div><small style={{color:'#888'}}>{s.equipo}</small></div>
                  </td>
                  <td><span style={{background: s.tipo==='Amarilla'?'#facc15':'#ef4444', color:'black', padding:'2px 6px', borderRadius:'4px', fontSize:'0.7rem', fontWeight:'bold'}}>{s.tipo.toUpperCase()}</span></td>
                  <td style={{fontStyle:'italic', color:'#ccc'}}>{s.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fair Play */}
        <div className="table-card" style={{borderColor:'#facc15'}}>
          <div className="table-header" style={{color:'#fde047', borderLeft:'5px solid #facc15', background:'rgba(250, 204, 21, 0.1)'}}><span>🤝</span> Fair Play</div>
          <table className="pro-table">
             <thead><tr><th style={{textAlign:'left'}}>Club</th><th>🟨</th><th>🟥</th><th>Pts Neg.</th></tr></thead>
             <tbody>
               {data.fairPlay.length===0 && <tr><td colSpan="4" style={{textAlign:'center', color:'#666', padding:'20px'}}>Limpio.</td></tr>}
               {data.fairPlay.map((t, i) => (
                 <tr key={i}>
                   <td className="team-name-cell">{t.logoUrl && <img src={t.logoUrl} className="team-logo-mini" alt=""/>}{t.nombre}</td>
                   <td style={{color:'#facc15', fontWeight:'bold'}}>{t.amarillas}</td>
                   <td style={{color:'#ef4444', fontWeight:'bold'}}>{t.rojas}</td>
                   <td style={{fontWeight:'bold'}}>{t.total}</td>
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