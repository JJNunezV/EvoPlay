import React, { useState, useEffect } from 'react';
import api from '../api';
// Asegúrate de que estas rutas coincidan con tus nombres de archivo
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // Toda la lógica que antes estaba en App.js ahora vive aquí.
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/equipos');
      setTeams(response.data);
    } catch (err) {
      console.error("Error al obtener los equipos", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
  };

  return (
    <div>
      <h1>Gestión de Equipos</h1>
      <TeamList teams={teams} onTeamDeleted={fetchTeams} onEditClick={handleEditClick} />

      {editingTeam ? (
        <EditTeamForm team={editingTeam} onUpdateComplete={handleUpdateComplete} />
      ) : (
        <CreateTeamForm onTeamCreated={fetchTeams} />
      )}
    </div>
  );
}

export default TeamsPage;