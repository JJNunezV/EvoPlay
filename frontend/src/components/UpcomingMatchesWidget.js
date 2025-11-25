import React from 'react';

function UpcomingMatchesWidget({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div style={{ padding: '30px', background: 'var(--panel-bg)', borderRadius: '12px', color: '#888', textAlign: 'center', border:'1px dashed var(--border)', fontStyle:'italic' }}>
        No hay partidos programados próximamente.
      </div>
    );
  }

  // Función para formatear la fecha bonita (ej: SÁBADO 24 NOV - 8:00 PM)
  const formatearFechaCompleta = (fechaString) => {
    const fecha = new Date(fechaString);
    // Intentamos usar Intl.DateTimeFormat si está disponible, sino fallback simple
    try {
        return new Intl.DateTimeFormat('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
        }).format(fecha).toUpperCase();
    } catch (e) {
        return fecha.toLocaleDateString();
    }
  };

  return (
    <div className="match-banner-grid">
      {matches.map((match) => (
        <div key={match._id} className="match-banner">
          
          {/* Badge de Fecha Superior */}
          <div className="match-date-badge">
            {formatearFechaCompleta(match.fecha)}
          </div>

          {/* Contenido del Enfrentamiento */}
          <div className="match-versus-container">
            
            {/* Equipo Local */}
            <div className="team-block local">
              {match.equipoLocal.logoUrl ? (
                <img src={match.equipoLocal.logoUrl} alt="logo" className="team-logo-large" />
              ) : (
                <span style={{fontSize:'3rem'}}>🛡️</span>
              )}
              <div className="team-name-banner">{match.equipoLocal.nombre}</div>
            </div>

            {/* Separador VS */}
            <div className="versus-separator">VS</div>

            {/* Equipo Visitante */}
            <div className="team-block visitante">
              {match.equipoVisitante.logoUrl ? (
                <img src={match.equipoVisitante.logoUrl} alt="logo" className="team-logo-large" />
              ) : (
                <span style={{fontSize:'3rem'}}>🛡️</span>
              )}
              <div className="team-name-banner">{match.equipoVisitante.nombre}</div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default UpcomingMatchesWidget;