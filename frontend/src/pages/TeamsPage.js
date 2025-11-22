import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  // Este estado guarda el equipo que quieres editar. Si es null, mostramos "Crear".
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/api/equipos');
      setTeams(response.data);
    } catch (err) {
      console.error("Error al obtener los equipos", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Esta función se activa cuando le das click al botón amarillo
  const handleEditClick = (team) => {
    console.log("¡TeamsPage recibió la orden! Editando a:", team.nombre);
    setEditingTeam(team); // <--- ESTO ACTIVA EL MODO EDICIÓN
    
    // Scroll suave hacia el formulario para que veas que cambió
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  // Esta función se activa cuando terminas de guardar los cambios
  const handleUpdateComplete = () => {
    setEditingTeam(null); // Regresamos al modo "Crear"
    fetchTeams(); // Refrescamos la lista
  };

  return (
    <div>
      <h1>Gestión de Equipos</h1>
      
      <TeamList 
        teams={teams} 
        onTeamDeleted={fetchTeams} 
        onEditClick={handleEditClick} 
      />
      
      <hr style={{margin: '30px 0', borderTop: '2px dashed #ccc'}} />

      {/* AQUÍ ESTÁ LA MAGIA DEL CAMBIO */}
      {editingTeam ? (
        <div style={{backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px'}}>
          <EditTeamForm 
            team={editingTeam} 
            onUpdateComplete={handleUpdateComplete} 
          />
        </div>
      ) : (
        <CreateTeamForm 
          onTeamCreated={fetchTeams} 
        />
      )}
    </div>
  );
}

export default TeamsPage;