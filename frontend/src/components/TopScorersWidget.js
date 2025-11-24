import React from 'react';

function TopScorersWidget({ scorers }) {
  if (!scorers || scorers.length === 0) {
    return (
      <div style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '12px', color: '#888', textAlign: 'center', border:'1px dashed var(--border)' }}>
        Aún no hay registros de goleo.
      </div>
    );
  }

  return (
    // Usamos el nuevo contenedor de tabla de lujo
    <div className="luxury-table-container">
      <table className="luxury-table">
        <thead>
          <tr>
            <th style={{textAlign:'center'}}>#</th>
            <th>Jugador / Equipo</th>
            <th style={{textAlign:'center'}}>Goles</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, index) => (
            <tr key={index}>
              {/* Posición (Ranking) */}
              <td className="rank-cell">
                {index + 1}
              </td>
              
              {/* Nombre y Escudo del Equipo */}
              <td>
                <div className="player-cell">
                  {scorer.logoEquipo ? (
                    <img src={scorer.logoEquipo} alt={scorer.nombreEquipo} className="team-logo-small" />
                  ) : (
                    <span style={{fontSize:'1.5rem'}}>⚽</span>
                  )}
                  <div>
                    <div style={{fontSize:'1.05rem'}}>{scorer.nombre}</div>
                    <div style={{fontSize:'0.8rem', color:'var(--text-gray)', fontWeight:'normal'}}>
                      {scorer.nombreEquipo}
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Cantidad de Goles */}
              <td className="goals-cell">
                {scorer.goles}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopScorersWidget;