import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // Iniciamos siempre con un array vacío para que no truene
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/equipos');
      
      // 🛡️ BLINDAJE: Solo guardamos si es una lista real (Array)
      if (Array.isArray(response.data)) {
        setTeams(response.data);
        setError(null);
      } else {
        console.error("El servidor no devolvió una lista:", response.data);
        setTeams([]); // Si llega basura, ponemos lista vacía
      }
    } catch (err) {
      console.error("Error al obtener los equipos", err);
      setError("No se pudieron cargar los equipos. Revisa tu conexión.");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtrado seguro
  const equiposFiltrados = (Array.isArray(teams) ? teams : []).filter(t => 
    filtroCategoria === 'Todos' ? true : t.categoria === filtroCategoria
  );

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>Cargando equipos...</div>;

  return (
    <div style={{paddingBottom:'80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', marginBottom:'30px', color:'white'}}>Gestión de Equipos</h1>
      
      {/* Mensaje de error si algo falló */}
      {error && <div style={{background:'#f8d7da', color:'#721c24', padding:'10px', borderRadius:'5px', marginBottom:'20px'}}>{error}</div>}

      {/* FILTRO */}
      <div style={{
        background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333',
        display: 'flex', alignItems: 'center', gap: '15px'
      }}>
        <label style={{fontWeight:'bold', color:'var(--gold)', fontSize:'1.1rem'}}>Filtrar:</label>
        <select 
          value={filtroCategoria} 
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{
            padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#000', color: 'white', fontSize:'1rem', flex: 1
          }}
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

      {/* FORMULARIO */}
      <div style={{background:'#1a1a1a', padding:'30px', borderRadius:'16px', border:'1px solid #333', boxShadow:'0 10px 30px rgba(0,0,0,0.5)'}}>
        {editingTeam ? (
          <>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
               <h2 style={{margin:0, color:'var(--gold)'}}>✏️ Editando Equipo</h2>
               <button onClick={() => setEditingTeam(null)} style={{background:'none', border:'1px solid #555', color:'#aaa', padding:'5px 15px', borderRadius:'20px', cursor:'pointer'}}>Cancelar</button>
            </div>
            <EditTeamForm team={editingTeam} onUpdateComplete={handleUpdateComplete} />
          </>
        ) : (
          <>
            <h2 style={{marginTop:0, marginBottom:'20px', color:'#4ade80'}}>➕ Crear Nuevo Equipo</h2>
            <CreateTeamForm onTeamCreated={fetchTeams} />
          </>
        )}
      </div>
    </div>
  );
}

export default TeamsPage;