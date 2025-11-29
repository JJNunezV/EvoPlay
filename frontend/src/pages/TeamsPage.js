import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // Estados iniciales seguros
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/equipos');
      
      // Validación de seguridad: ¿Es un array?
      if (Array.isArray(response.data)) {
        setTeams(response.data);
        setError(null);
      } else {
        console.error("Datos inválidos:", response.data);
        setTeams([]); 
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      setError("No se pudo conectar con el servidor.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  // Filtrado seguro
  const listaSegura = Array.isArray(teams) ? teams : [];
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? listaSegura 
    : listaSegura.filter(t => t.categoria === filtroCategoria);

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>Cargando...</div>;

  return (
    <div style={{paddingBottom:'80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', marginBottom:'30px', color:'white'}}>Gestión de Equipos</h1>
      
      {error && <div style={{background:'#ef4444', color:'white', padding:'10px', borderRadius:'5px', textAlign:'center', marginBottom:'20px'}}>⚠️ {error}</div>}

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