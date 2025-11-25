import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  const fetchTeams = async () => {
    try {
      const response = await api.get('/api/equipos');
      setTeams(response.data);
    } catch (err) { console.error("Error", err); }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
  };

  const equiposFiltrados = filtroCategoria === 'Todos' ? teams : teams.filter(t => t.categoria === filtroCategoria);

  return (
    <div style={{paddingBottom:'50px'}}>
      <h1>Gestión de Equipos</h1>
      
      {/* Filtro */}
      <div style={{background: '#1a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333'}}>
        <label style={{fontWeight:'bold', color:'var(--gold)', marginRight:'10px'}}>Filtrar:</label>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: 'white'}}>
          <option value="Todos">Todos</option>
          <option value="Fútbol 7">Fútbol 7</option>
          <option value="Pádel">Pádel</option>
          <option value="Voleibol">Voleibol</option>
        </select>
      </div>

      <TeamList teams={equiposFiltrados} onTeamDeleted={fetchTeams} onEditClick={handleEditClick} />
      
      <hr style={{margin: '30px 0', borderTop: '1px solid #333'}} />

      {/* Solo Formularios de Equipos */}
      {editingTeam ? (
        <EditTeamForm team={editingTeam} onUpdateComplete={handleUpdateComplete} />
      ) : (
        <CreateTeamForm onTeamCreated={fetchTeams} />
      )}
    </div>
  );
}

export default TeamsPage;