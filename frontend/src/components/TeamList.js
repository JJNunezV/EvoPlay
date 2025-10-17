import React from 'react';
import api from '../api'; // Asegúrate de que axios esté importado

// Recibimos las props "teams" y "onTeamDeleted" desde App.js
function TeamList({ teams, onTeamDeleted }) {

  // 1. Aquí definimos la función que faltaba
  const handleDelete = async (teamId) => {
    // Pedimos confirmación al usuario
    if (window.confirm('¿Estás seguro de que quieres borrar este equipo?')) {
      try {
        // Hacemos la llamada a la API para borrar
        await axios.delete(`http://localhost:5000/api/equipos/${teamId}`);
        alert('Equipo borrado');
        onTeamDeleted(); // Llamamos a la función para refrescar la lista
      } catch (error) {
        console.error('Error al borrar el equipo', error);
        alert('No se pudo borrar el equipo');
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
          {/* El .map crea un <li> por cada equipo */}
          {teams.map(team => (
            <li key={team._id}>
              <strong>{team.nombre}</strong>
              
              {/* 2. El botón ahora está DENTRO del <li> */}
              {/* Así sabe a qué "team" pertenece */}
              <button onClick={() => handleDelete(team._id)} className="delete-btn">
                Borrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeamList;