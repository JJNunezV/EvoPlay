import React from 'react';

function UpcomingMatchesWidget({ matches }) {
  if (matches.length === 0) return <p>No hay próximos partidos programados.</p>;

  return (
    <div className="widget">
      <h3>Próximos Partidos</h3>
      {matches.map(match => (
        <div key={match._id} className="widget-item">
          <span>{match.equipoLocal.nombre}</span>
          <strong>VS</strong>
          <span>{match.equipoVisitante.nombre}</span>
        </div>
      ))}
    </div>
  );
}

export default UpcomingMatchesWidget;