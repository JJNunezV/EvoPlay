import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // INICIALIZACIÓN SEGURA: Siempre es un array vacío
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/api/equipos');
      // SIEMPRE verificamos que sea un array antes de guardarlo
      if (Array.isArray(response.data)) {
        setTeams(response.data);
      } else {
        setTeams([]); 
      }
    } catch (err) {
      console.error("Error cargando equipos", err);
      setTeams([]); // En error, array vacío para no congelar
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
    // Quitamos el scroll suave por si eso estuviera causando conflicto en algunos navegadores
    window.scrollTo(0, document.body.scrollHeight);
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
    window.scrollTo(0, 0);
  };

  // FILTRADO A PRUEBA DE BALAS
  // Si teams es null o undefined, usamos []
  const safeTeams = teams || [];
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? safeTeams 
    : safeTeams.filter(t => t.categoria === filtroCategoria);

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>Cargando equipos...</div>;

  return (
    <div style={{paddingBottom:'80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', marginBottom:'30px', color:'white'}}>Gestión de Equipos</h1>
      
      {/* FILTRO */}
      <div style={{
        background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333',
        display: 'flex', alignItems: 'center', gap: '15px'
      }}>
        <label style={{fontWeight:'bold', color:'var(--gold)', fontSize:'1.1rem'}}>Filtrar:</label>
        <select 
          value={filtroCategoria} 
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#000', color: 'white', flex: 1}}
        >
          <option value="Todos">📂 Ver Todos</option>
          <option value="Fútbol 7">⚽ Fútbol 7</option>
          <option value="Fútbol 11">🏟️ Fútbol 11</option>
          <option value="Fútbol Rápido">⚡ Fútbol Rápido</option>
          <option value="Pádel">🎾 Pádel</option>
          <option value="Voleibol">🏐 Voleibol</option>
        </select>
      </div>

      {/* LISTA */}
      <TeamList 
        teams={equiposFiltrados} 
        onTeamDeleted={fetchTeams} 
        onEditClick={handleEditClick} 
      />
      
      <div style={{margin: '40px 0', borderTop: '2px dashed #444'}}></div>

      {/* FORMULARIOS */}
      <div style={{background:'#1a1a1a', padding:'30px', borderRadius:'16px', border:'1px solid #333'}}>
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