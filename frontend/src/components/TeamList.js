import React from 'react';
import api from '../api';

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este equipo?')) {
      try {
        await api.delete(`/api/equipos/${teamId}`);
        alert('Equipo borrado exitosamente');
        onTeamDeleted();
      } catch (error) {
        console.error('Error al borrar', error);
        alert('No se pudo borrar el equipo.');
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
              
              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                 {team.logoUrl ? (
                   <img src={team.logoUrl} alt="logo" width="40" height="40" style={{objectFit:'contain'}}/>
                 ) : (
                   <span style={{fontSize:'2rem'}}>⚽</span>
                 )}
                 <div>
                   <strong style={{fontSize: '1.1rem'}}>{team.nombre}</strong>
                   <div style={{fontSize: '0.8rem', color: '#555'}}>
                     {/* 👇 AQUÍ MOSTRAMOS LA CATEGORÍA */}
                     <span style={{backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px', marginRight: '5px'}}>
                        {team.categoria || 'Fútbol 7'}
                     </span>
                     {team.jugadores ? `${team.jugadores.length} Jugadores` : '0 Jugadores'}
                   </div>
                 </div>
              </div>

              <div style={{display:'flex', gap:'10px'}}>
                <button onClick={() => onEditClick(team)} style={{backgroundColor: '#ffc107', border:'none', padding:'8px 15px', cursor:'pointer', borderRadius:'5px', fontWeight: 'bold'}}>✏️ Editar</button>
                <button onClick={() => handleDelete(team._id)} style={{backgroundColor: '#dc3545', color:'white', border:'none', padding:'8px 15px', cursor:'pointer', borderRadius:'5px', fontWeight: 'bold'}}>🗑️ Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{padding: '20px', textAlign: 'center', color: '#777', border: '2px dashed #ddd', borderRadius: '8px'}}>
          <p>No hay equipos registrados todavía.</p>
        </div>
      )}
    </div>
  );
}

export default TeamList;