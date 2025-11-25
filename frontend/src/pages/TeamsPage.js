import React, { useState, useEffect } from 'react';
import api from '../api'; // Importamos api
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  
  // Estado para el filtro de categoría
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  const fetchTeams = async () => {
    try {
      // Usamos api.get que ya incluye el token
      const response = await api.get('/api/equipos');
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
  };

  // Lógica de filtrado
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? teams 
    : teams.filter(team => team.categoria === filtroCategoria);

  return (
    <div style={{paddingBottom:'50px'}}>
      <h1>Gestión de Equipos</h1>
      
      {/* BARRA DE FILTRO */}
      <div style={{
        background: '#1a1a1a', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        border: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <label style={{fontWeight:'bold', color:'var(--gold)'}}>Filtrar por Liga:</label>
        <select 
          value={filtroCategoria} 
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: 'white'}}
        >
          <option value="Todos">📂 Ver Todos</option>
          <option value="Fútbol 7">⚽ Fútbol 7</option>
          <option value="Fútbol 11">🏟️ Fútbol 11</option>
          <option value="Fútbol Rápido">⚡ Fútbol Rápido</option>
          <option value="Pádel">🎾 Pádel</option>
          <option value="Voleibol">🏐 Voleibol</option>
        </select>
        <span style={{color:'#666', fontSize:'0.9rem'}}>
          ({equiposFiltrados.length} equipos encontrados)
        </span>
      </div>

      {/* LISTA DE EQUIPOS */}
      <TeamList 
        teams={equiposFiltrados} 
        onTeamDeleted={fetchTeams} 
        onEditClick={handleEditClick} 
      />
      
      <hr style={{margin: '30px 0', borderTop: '2px dashed #333'}} />

      {/* FORMULARIOS (Crear o Editar) */}
      {editingTeam ? (
        <div style={{backgroundColor: 'rgba(197, 160, 89, 0.1)', padding: '20px', borderRadius: '8px', border: '1px solid var(--gold)'}}>
          <EditTeamForm 
            team={editingTeam} 
            onUpdateComplete={handleUpdateComplete} 
          />
        </div>
      ) : (
        <div style={{backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #333'}}>
          <CreateTeamForm 
            onTeamCreated={fetchTeams} 
          />
        </div>
      )}
    </div>
  );
}

export default TeamsPage;