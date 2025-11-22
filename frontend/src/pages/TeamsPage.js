// frontend/src/pages/TeamsPage.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm'; 

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      // Usamos 'api.get', que ya incluye el token de sesión
      const response = await api.get('/equipos');
      setTeams(response.data);
    } catch (err) {
      console.error("ERROR en TeamsPage al obtener equipos:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // (Aquí irían las funciones handleEditClick y handleUpdateComplete)
  return (
    <div>
      <h1>Gestión de Equipos</h1>
      <TeamList teams={teams} onTeamDeleted={fetchTeams} onEditClick={() => {}} />
      <CreateTeamForm onTeamCreated={fetchTeams} />
      {/* (Aquí iría la lógica del EditTeamForm) */}
    </div>
  );
}
export default TeamsPage;