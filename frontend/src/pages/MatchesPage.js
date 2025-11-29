import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [partidos, setPartidos] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔥 NUEVO: Estado para la categoría seleccionada
  const [categoria, setCategoria] = useState('Fútbol 7');
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const fetchPartidos = async () => {
    try {
      // 🔥 NUEVO: Pedimos los partidos filtrados por la categoría actual
      const response = await api.get(`/api/partidos?categoria=${categoria}`);
      setPartidos(response.data);
    } catch (error) {
      console.error('Error al cargar los partidos:', error);
    }
  };

  // Recargar partidos cada vez que cambia la categoría
  useEffect(() => {
    fetchPartidos();
  }, [categoria]);

  const handleEditClick = (match) => {
    setMatchToEdit(match);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para formatear fecha (ej: Sábado 24 Nov - 8:00 PM)
  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    try {
      return new Intl.DateTimeFormat('es-ES', { 
        weekday: 'long', day: 'numeric', month: 'short', 
        hour: '2-digit', minute: '2-digit' 
      }).format(fecha).toUpperCase();
    } catch(e) { return fecha.toLocaleDateString(); }
  };

  // Separar partidos en Programados y Resultados
  const programados = partidos.filter(p => !p.finalizado);
  const resultados = partidos.filter(p => p.finalizado).sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

  // Componente de tarjeta de partido (reutilizable)
  const MatchCard = ({ match, esResultado }) => {
    // Determinar qué etiqueta mostrar para el marcador (Sets vs Goles)
    const esDeporteSets = ['Voleibol', 'Pádel', 'Tenis'].includes(categoria);
    const labelMarcador = esDeporteSets ? 'Sets' : '';

    return (
      <div className="match-banner" style={{marginBottom:'20px', position:'relative'}}>
        {/* Botón de Editar (Solo Admin) */}
        {isAuthenticated && (
          <button 
            onClick={() => handleEditClick(match)} 
            style={{position:'absolute', top:'10px', right:'10px', background:'#eab308', border:'none', borderRadius:'5px', padding:'5px 10px', cursor:'pointer', fontWeight:'bold', zIndex:10}}
          >
            ✏️ Editar
          </button>
        )}
        
        <div className="match-date-badge">
          {formatearFecha(match.fecha)}
        </div>
        <div className="match-versus-container">
          {/* Local */}
          <div className="team-block local">
            {match.equipoLocal.logoUrl ? <img src={match.equipoLocal.logoUrl} alt="logo" className="team-logo-large" /> : <span style={{fontSize:'3rem'}}>🛡️</span>}
            <div className="team-name-banner">{match.equipoLocal.nombre}</div>
          </div>
          
          {/* Marcador o VS */}
          <div className="versus-separator" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            {esResultado ? (
               <>
                 <div style={{fontSize:'3rem', color:'white'}}>{match.golesLocal} - {match.golesVisitante}</div>
                 {labelMarcador && <span style={{fontSize:'0.9rem', color:'var(--gold)'}}>({labelMarcador})</span>}
               </>
            ) : (
               <span style={{fontSize:'2.5rem'}}>VS</span>
            )}
          </div>

          {/* Visitante */}
          <div className="team-block visitante">
            {match.equipoVisitante.logoUrl ? <img src={match.equipoVisitante.logoUrl} alt="logo" className="team-logo-large" /> : <span style={{fontSize:'3rem'}}>🛡️</span>}
            <div className="team-name-banner">{match.equipoVisitante.nombre}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{paddingBottom: '80px', maxWidth:'1000px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', fontSize:'3rem', marginBottom:'30px'}}>PARTIDOS</h1>
      
      {/* 🔥 NUEVO: BOTONES DE CATEGORÍA (Igual que en Estadísticas) */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'40px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              background: categoria === cat ? 'var(--gold)' : '#222',
              color: categoria === cat ? 'black' : 'white',
              border: '1px solid #444',
              padding: '10px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.3s',
              boxShadow: categoria === cat ? '0 0 15px rgba(197, 160, 89, 0.5)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Botón para Crear Partido (Solo Admin) */}
      {isAuthenticated && (
        <div style={{textAlign:'center', marginBottom:'30px'}}>
          <button 
            onClick={() => { setShowCreateForm(!showCreateForm); setMatchToEdit(null); }}
            style={{padding:'15px 30px', background:'var(--gold)', color:'black', border:'none', borderRadius:'8px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', margin:'0 auto'}}
          >
            {showCreateForm ? '❌ Cancelar' : '➕ Nuevo Partido / Resultado'}
          </button>
        </div>
      )}

      {/* Formulario (Si está visible) */}
      {showCreateForm && (
        <div style={{marginBottom:'50px', border:'2px solid var(--gold)', borderRadius:'12px', padding:'5px'}}>
           <CreateMatchForm 
             onMatchCreated={() => { setShowCreateForm(false); fetchPartidos(); setMatchToEdit(null); }} 
             matchToPlay={matchToEdit}
             onCancel={() => { setShowCreateForm(false); setMatchToEdit(null); }}
           />
        </div>
      )}

      {/* --- SECCIÓN: PRÓXIMOS PARTIDOS --- */}
      <div style={{marginBottom:'50px'}}>
        <h2 style={{textAlign:'center', borderBottom:'2px solid var(--gold)', paddingBottom:'10px', marginBottom:'30px', color:'var(--gold)'}}>📅 Próximos Encuentros - {categoria}</h2>
        <div className="match-banner-grid">
           {programados.length === 0 ? (
              <div style={{gridColumn:'1/-1', textAlign:'center', padding:'30px', color:'#888', border:'1px dashed #444', borderRadius:'10px'}}>No hay partidos programados para {categoria}.</div>
           ) : (
              programados.map(p => <MatchCard key={p._id} match={p} esResultado={false} />)
           )}
        </div>
      </div>

      {/* --- SECCIÓN: RESULTADOS RECIENTES --- */}
      <div>
        <h2 style={{textAlign:'center', borderBottom:'2px solid #4ade80', paddingBottom:'10px', marginBottom:'30px', color:'#4ade80'}}>✅ Resultados Recientes - {categoria}</h2>
        <div className="match-banner-grid">
           {resultados.length === 0 ? (
              <div style={{gridColumn:'1/-1', textAlign:'center', padding:'30px', color:'#888', border:'1px dashed #444', borderRadius:'10px'}}>No hay resultados registrados para {categoria}.</div>
           ) : (
              resultados.map(p => <MatchCard key={p._id} match={p} esResultado={true} />)
           )}
        </div>
      </div>

    </div>
  );
}

export default MatchesPage;