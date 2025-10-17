import React from 'react';

function TopScorersWidget({ scorers }) {
  if (scorers.length === 0) return <p>Aún no hay goleadores.</p>;

  return (
    <div className="widget">
      <h3>Máximos Goleadores</h3>
      {scorers.map((scorer, index) => (
        <div key={index} className="widget-item scorer-item">
          <img src={scorer.logoEquipo} alt={scorer.nombreEquipo} width="20"/>
          <span>{scorer.nombre} ({scorer.nombreEquipo})</span>
          <strong>{scorer.goles}</strong>
        </div>
      ))}
    </div>
  );
}

export default TopScorersWidget;