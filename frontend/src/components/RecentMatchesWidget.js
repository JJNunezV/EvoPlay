import React from 'react';

function RecentMatchesWidget({ matches }) {
  if (matches.length === 0) return <p>No hay resultados recientes.</p>;

  return (
    <div className="widget">
      <h3 style={{borderBottom: '2px solid #28a745', paddingBottom:'5px'}}>✅ Resultados Recientes</h3>
      {matches.map(match => (
        <div key={match._id} className="widget-item" style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.9rem'}}>
          <span style={{flex:1, textAlign:'right'}}>{match.equipoLocal.nombre}</span>
          <span style={{background:'#333', color:'white', padding:'2px 8px', borderRadius:'4px', margin:'0 5px'}}>
            {match.golesLocal} - {match.golesVisitante}
          </span>
          <span style={{flex:1, textAlign:'left'}}>{match.equipoVisitante.nombre}</span>
        </div>
      ))}
    </div>
  );
}

export default RecentMatchesWidget;