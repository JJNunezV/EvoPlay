import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  // Este es el estado que dice si estamos editando o no
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

  // Esta función recibe el equipo desde la lista y activa el modo edición
  const handleEditClick = (team) => {
    console.log("TeamsPage recibió la orden de editar:", team.nombre); // Chismoso
    setEditingTeam(team);
  };

  // Esta función se llama cuando terminas de editar para volver a crear
  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
  };

  return (
    <div>
      <h1>Gestión de Equipos</h1>
      
      {/* Le pasamos la función handleEditClick a la lista */}
      <TeamList 
        teams={teams} 
        onTeamDeleted={fetchTeams} 
        onEditClick={handleEditClick} 
      />
      
      <hr style={{margin: '20px 0'}} />

      {/* MAGIA: Si editingTeam tiene datos, muestra Editar. Si no, muestra Crear */}
      {editingTeam ? (
        <EditTeamForm 
          team={editingTeam} 
          onUpdateComplete={handleUpdateComplete} 
        />
      ) : (
        <CreateTeamForm 
          onTeamCreated={fetchTeams} 
        />
      )}
    </div>
  );
}

export default TeamsPage;