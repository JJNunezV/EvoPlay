import React from 'react';
import api from '../api';

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este equipo?')) {
      try {
        await api.delete(`/api/equipos/${teamId}`);
        alert('Equipo borrado');
        onTeamDeleted();
      } catch (error) {
        console.error('Error al borrar', error);
        alert('No se pudo borrar.');
      }
    }
  };

  return (
    <div style={{marginTop: '20px'}}>
      <h2>Lista de Equipos</h2>
      {teams && teams.length > 0 ? (
        <ul style={{listStyle: 'none', padding: 0}}>
          {teams.map(team => (
            <li key={team._id} style={{borderBottom: '1px solid #eee', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                 {/* Si hay logo lo mostramos chiquito */}
                 {team.logoUrl && <img src={team.logoUrl} alt="logo" width="30" height="30" style={{objectFit:'contain'}}/>}
                 <strong>{team.nombre}</strong>
              </div>
              <div style={{display:'flex', gap:'5px'}}>
                {/* 👇 ESTE ES EL BOTÓN IMPORTANTE */}
                <button 
                  onClick={() => {
                    console.log("Click en editar:", team.nombre); // Debug para ver si funciona
                    onEditClick(team);
                  }} 
                  style={{backgroundColor: '#ffc107', border:'none', padding:'5px 10px', cursor:'pointer', borderRadius:'4px'}}
                >
                  Editar
                </button>
                <button onClick={() => handleDelete(team._id)} style={{backgroundColor: '#dc3545', color:'white', border:'none', padding:'5px 10px', cursor:'pointer', borderRadius:'4px'}}>Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay equipos registrados todavía.</p>
      )}
    </div>
  );
}

export default TeamList;