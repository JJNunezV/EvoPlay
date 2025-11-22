import React from 'react';
import api from '../api'; // Importamos nuestro 'api.js'

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    if (window.confirm('¿Estás seguro de que quieres borrar este equipo?')) {
      try {
        // Usamos 'api.delete', que ya incluye el token de sesión
       await api.delete(`/api/equipos/${teamId}`);
        alert('Equipo borrado');
        onTeamDeleted();
      } catch (error) {
        console.error('Error al borrar el equipo', error);
        alert('No se pudo borrar el equipo. ¿Has iniciado sesión?');
      }
    }
  };

  return (
    <div>
      <h2>Lista de Equipos</h2>
      {teams.length === 0 ? (
        <p>No hay equipos registrados todavía.</p>
      ) : (
        <ul>
          {teams.map(team => (
            <li key={team._id}>
              <strong>{team.nombre}</strong>
              <div>
                <button onClick={() => onEditClick(team)} className="edit-btn">Editar</button>
                <button onClick={() => handleDelete(team._id)} className="delete-btn">Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeamList;