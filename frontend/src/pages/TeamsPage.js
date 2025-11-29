import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos'); // Filtro visual

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

  // Lógica: Si eliges "Todos", muestra todos. Si eliges "Fútbol", solo muestra esos.
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? teams 
    : teams.filter(t => t.categoria === filtroCategoria);

  return (
    <div style={{paddingBottom:'50px'}}>
      <h1>Gestión de Equipos</h1>
      
      {/* FILTRO DE CATEGORÍA */}
      <div className="widget" style={{display:'flex', alignItems:'center', gap:'15px', marginBottom:'20px'}}>
        <label style={{color:'var(--gold)', fontWeight:'bold'}}>Ver Liga:</label>
        <select 
          value={filtroCategoria} 
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{padding:'10px', background:'#000', color:'white', border:'1px solid #444', borderRadius:'5px'}}
        >
          <option value="Todos">📂 Todas</option>
          <option value="Fútbol 7">⚽ Fútbol 7</option>
          <option value="Fútbol 11">🏟️ Fútbol 11</option>
          <option value="Fútbol Rápido">⚡ Fútbol Rápido</option>
          <option value="Pádel">🎾 Pádel</option>
          <option value="Voleibol">🏐 Voleibol</option>
        </select>
      </div>

      {/* LISTA DE EQUIPOS */}
      <TeamList teams={equiposFiltrados} onTeamDeleted={fetchTeams} onEditClick={handleEditClick} />
      
      <hr style={{margin: '40px 0', borderTop: '1px dashed #444'}} />

      {/* FORMULARIO (Solo crear/editar equipos) */}
      <div className="widget">
        {editingTeam ? (
            <EditTeamForm team={editingTeam} onUpdateComplete={handleUpdateComplete} />
        ) : (
            <CreateTeamForm onTeamCreated={fetchTeams} />
        )}
      </div>
    </div>
  );
}

export default TeamsPage;