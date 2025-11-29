import React from 'react';
import api from '../api';

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    if (window.confirm('¿Estás seguro de borrar este equipo? Se borrarán sus estadísticas.')) {
      try {
        await api.delete(`/api/equipos/${teamId}`);
        alert('Equipo borrado');
        onTeamDeleted();
      } catch (error) {
        alert('Error al borrar');
      }
    }
  };

  return (
    <div>
      {teams && teams.length > 0 ? (
        <div style={{display:'grid', gap:'15px'}}>
          {teams.map(team => (
            <div key={team._id} style={{
              // ESTILO DE TARJETA OSCURA
              background: '#121212', 
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '15px 20px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}>
              
              {/* Info del Equipo */}
              <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                 {/* Logo */}
                 <div style={{width:'50px', height:'50px', display:'flex', alignItems:'center', justifyContent:'center', background:'#000', borderRadius:'50%', border:'1px solid #333'}}>
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt="logo" style={{width:'35px', height:'35px', objectFit:'contain'}}/>
                    ) : (
                      <span style={{fontSize:'1.5rem'}}>🛡️</span>
                    )}
                 </div>

                 {/* Textos (Color Blanco) */}
                 <div>
                   <div style={{color:'white', fontSize: '1.2rem', fontWeight: 'bold'}}>{team.nombre}</div>
                   <div style={{display:'flex', gap:'10px', fontSize: '0.85rem', marginTop:'4px'}}>
                     <span style={{color:'var(--gold)', background:'rgba(197, 160, 89, 0.1)', padding:'2px 8px', borderRadius:'4px'}}>
                        {team.categoria || 'Sin Cat.'}
                     </span>
                     <span style={{color:'#888'}}>
                        {team.jugadores ? team.jugadores.length : 0} Jugadores
                     </span>
                   </div>
                 </div>
              </div>

              {/* Botones */}
              <div style={{display:'flex', gap:'10px'}}>
                <button 
                  onClick={() => onEditClick(team)} 
                  style={{background: '#eab308', color:'black', border:'none', padding:'8px 16px', cursor:'pointer', borderRadius:'6px', fontWeight:'bold'}}
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleDelete(team._id)} 
                  style={{background: '#ef4444', color:'white', border:'none', padding:'8px 16px', cursor:'pointer', borderRadius:'6px', fontWeight:'bold'}}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding: '40px', textAlign: 'center', color: '#666', border: '2px dashed #333', borderRadius: '12px'}}>
          <h3>No hay equipos en esta categoría.</h3>
          <p>Usa el formulario de abajo para crear uno.</p>
        </div>
      )}
    </div>
  );
}

export default TeamList;