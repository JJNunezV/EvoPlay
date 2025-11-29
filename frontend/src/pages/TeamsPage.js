import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // 1. Inicializamos siempre como array vacío []
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // Aseguramos la ruta con /api
      const response = await api.get('/api/equipos');
      
      // 2. Verificamos si la respuesta es válida
      if (Array.isArray(response.data)) {
        setTeams(response.data);
        setError(null);
      } else {
        setTeams([]); // Si llega basura, usamos lista vacía
      }
    } catch (err) {
      console.error("Error al obtener los equipos", err);
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. BLINDAJE: Filtramos sobre una lista segura
  const listaSegura = Array.isArray(teams) ? teams : [];
  
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? listaSegura 
    : listaSegura.filter(t => t.categoria === filtroCategoria);

  if (loading) return <div style={{padding:'50px', textAlign:'center', color:'white'}}>Cargando gestión de equipos...</div>;

  return (
    <div style={{paddingBottom:'80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', marginBottom:'30px', color:'white'}}>Gestión de Equipos</h1>
      
      {/* Mensaje de error suave si falla */}
      {error && <div style={{background:'#ef4444', color:'white', padding:'10px', borderRadius:'5px', marginBottom:'20px', textAlign:'center'}}>{error}</div>}

      {/* BARRA DE FILTRO */}
      <div style={{
        background: '#1a1a1a', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #333',
        display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <label style={{fontWeight:'bold', color:'var(--gold)', fontSize:'1.1rem'}}>Filtrar:</label>
        <select 
          value={filtroCategoria} 
          onChange={e => setFiltroCategoria(e.target.value)}
          style={{padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#000', color: 'white', fontSize:'1rem', flex: 1}}
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