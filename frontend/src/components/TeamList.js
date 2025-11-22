import React from 'react';
import api from '../api';

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    // Confirmación de seguridad antes de borrar
    if (window.confirm('¿Estás seguro de que quieres borrar este equipo?')) {
      try {
        // Usamos la ruta correcta con /api
        await api.delete(`/api/equipos/${teamId}`);
        alert('Equipo borrado exitosamente');
        onTeamDeleted(); // Avisamos para refrescar la lista
      } catch (error) {
        console.error('Error al borrar el equipo', error);
        alert('No se pudo borrar el equipo. ¿Tienes sesión iniciada?');
      }
    }
  };

  return (
    <div style={{marginTop: '20px'}}>
      <h2>Lista de Equipos Registrados</h2>
      
      {teams && teams.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {teams.map(team => (
            <li key={team._id} style={{
              border: '1px solid #ddd', 
              borderRadius: '8px',
              marginBottom: '10px', 
              padding: '15px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#fff'
            }}>
              
              {/* Lado Izquierdo: Logo y Nombre */}
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                 {team.logoUrl ? (
                   <img src={team.logoUrl} alt="logo" width="40" height="40" style={{objectFit:'contain'}}/>
                 ) : (
                   <span style={{fontSize:'2rem'}}>⚽</span>
                 )}
                 <div>
                   <strong style={{fontSize: '1.1rem'}}>{team.nombre}</strong>
                   <div style={{fontSize: '0.8rem', color: '#666'}}>
                     {team.jugadores ? `${team.jugadores.length} Jugadores` : '0 Jugadores'}
                   </div>
                 </div>
              </div>

              {/* Lado Derecho: Botones */}
              <div style={{display:'flex', gap:'10px'}}>
                
                {/* 👇 BOTÓN EDITAR: Al hacer click, le manda el equipo completo a TeamsPage */}
                <button 
                  onClick={() => onEditClick(team)} 
                  style={{
                    backgroundColor: '#ffc107', 
                    border:'none', 
                    padding:'8px 15px', 
                    cursor:'pointer', 
                    borderRadius:'5px', 
                    fontWeight: 'bold'
                  }}
                >
                  ✏️ Editar
                </button>

                {/* 👇 BOTÓN BORRAR */}
                <button 
                  onClick={() => handleDelete(team._id)} 
                  style={{
                    backgroundColor: '#dc3545', 
                    color:'white', 
                    border:'none', 
                    padding:'8px 15px', 
                    cursor:'pointer', 
                    borderRadius:'5px',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Borrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{padding: '20px', textAlign: 'center', color: '#777', border: '2px dashed #ddd', borderRadius: '8px'}}>
          <p>No hay equipos registrados todavía.</p>
          <p>¡Usa el formulario de abajo para crear el primero!</p>
        </div>
      )}
    </div>
  );
}

export default TeamList;