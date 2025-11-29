import React, { useState, useEffect } from 'react';
import api from '../api';
import TeamList from '../components/TeamList';
import CreateTeamForm from '../components/CreateTeamForm';
import EditTeamForm from '../components/EditTeamForm';

function TeamsPage() {
  // Estado inicial seguro
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Hacemos la petición
      const response = await api.get('/api/equipos');
      
      // 🛡️ VALIDACIÓN DE SEGURIDAD: ¿Es un array lo que llegó?
      if (response.data && Array.isArray(response.data)) {
        setTeams(response.data);
      } else {
        // Si no es array, ponemos vacío y avisamos en consola
        console.warn("Datos de equipos inválidos:", response.data);
        setTeams([]);
      }
    } catch (err) {
      console.error("Error fetchTeams:", err);
      setErrorMsg("No se pudieron cargar los equipos.");
      setTeams([]); // En caso de error, aseguramos que sea array vacío
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleEditClick = (team) => {
    setEditingTeam(team);
    // Scroll seguro
    try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); } catch(e){}
  };

  const handleUpdateComplete = () => {
    setEditingTeam(null);
    fetchTeams();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e){}
  };

  // 🛡️ FILTRADO SEGURO:
  // Incluso si 'teams' falló y es null, usamos [] para que .filter no explote
  const listaSegura = Array.isArray(teams) ? teams : [];
  
  const equiposFiltrados = filtroCategoria === 'Todos' 
    ? listaSegura 
    : listaSegura.filter(t => t.categoria === filtroCategoria);

  return (
    <div style={{paddingBottom:'80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', marginBottom:'30px', color:'white'}}>Gestión de Equipos</h1>
      
      {/* Mostrar error si existe */}
      {errorMsg && (
        <div style={{background:'#ef4444', color:'white', padding:'15px', borderRadius:'8px', marginBottom:'20px', textAlign:'center'}}>
          ⚠️ {errorMsg}
        </div>
      )}

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

      {/* CARGANDO O LISTA */}
      {loading ? (
        <div style={{textAlign:'center', padding:'40px', color:'#888'}}>Cargando lista de equipos...</div>
      ) : (
        <TeamList 
          teams={equiposFiltrados} 
          onTeamDeleted={fetchTeams} 
          onEditClick={handleEditClick} 
        />
      )}
      
      <div style={{margin: '40px 0', borderTop: '2px dashed #444'}}></div>

      {/* FORMULARIOS */}
      <div style={{background:'#1a1a1a', padding:'30px', borderRadius:'16px', border:'1px solid #333'}}>
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