import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel }) {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  
  // Filtro de Categoría
  const [categoria, setCategoria] = useState('Fútbol 7');

  // Datos del partido
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);

  // Marcador
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);
  
  // Eventos (Solo para deportes con goles/puntos individuales)
  const [eventosGol, setEventosGol] = useState([]);
  const [eventosTarjeta, setEventosTarjeta] = useState([]);

  // Inputs temporales
  const [golTemp, setGolTemp] = useState({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  const [tarjetaTemp, setTarjetaTemp] = useState({ jugadorId: '', tipo: 'Amarilla', minuto: '', motivo: '' });

  // Cargar equipos al inicio
  useEffect(() => {
    const fetchTeams = async () => {
      try { 
        const res = await api.get('/api/equipos'); 
        setTeams(res.data); 
      } catch (e) { console.error("Error cargando equipos"); }
    };
    fetchTeams();
  }, []);

  // Filtrar equipos cuando cambia la categoría
  useEffect(() => {
    const filtrados = teams.filter(t => t.categoria === categoria);
    setFilteredTeams(filtrados);
    // Resetear selección si cambiamos de deporte
    if (!matchToPlay) { setLocalId(''); setVisitanteId(''); }
  }, [categoria, teams, matchToPlay]);

  // Si viene un partido para editar, cargar sus datos
  useEffect(() => {
    if (matchToPlay) {
      setCategoria(matchToPlay.equipoLocal.categoria || 'Fútbol 7');
      setLocalId(matchToPlay.equipoLocal._id || matchToPlay.equipoLocal);
      setVisitanteId(matchToPlay.equipoVisitante._id || matchToPlay.equipoVisitante);
      setFecha(new Date(matchToPlay.fecha).toISOString().split('T')[0]);
      setEsProgramado(false);
      setScoreLocal(matchToPlay.golesLocal);
      setScoreVisitante(matchToPlay.golesVisitante);
    }
  }, [matchToPlay]);

  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // Determinar etiqueta del marcador según deporte
  const getScoreLabel = () => {
    if (categoria.includes('Fútbol')) return 'Goles';
    if (categoria === 'Voleibol' || categoria === 'Pádel') return 'Sets';
    return 'Puntos';
  };

  // --- LÓGICA DE GUARDADO ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipoLocal: localId, equipoVisitante: visitanteId, fecha, finalizado: !esProgramado,
      golesLocal: esProgramado ? 0 : scoreLocal,
      golesVisitante: esProgramado ? 0 : scoreVisitante,
      detallesGoles: esProgramado ? [] : eventosGol,
      detallesTarjetas: esProgramado ? [] : eventosTarjeta
    };

    try {
      if (matchToPlay) await api.put(`/api/partidos/${matchToPlay._id}`, payload);
      else await api.post('/api/partidos', payload);
      
      alert('¡Guardado con éxito!');
      onMatchCreated();
      if(onCancel) onCancel();
      if(!matchToPlay) { 
        setLocalId(''); setVisitanteId(''); setFecha(''); 
        setScoreLocal(0); setScoreVisitante(0); 
        setEventosGol([]); setEventosTarjeta([]); 
      }
    } catch (e) { alert('Error al guardar'); }
  };

  // (Aquí omití las funciones de agregarEventoGol y agregarTarjeta para no hacer el código gigante, 
  // pero deberías mantener las que ya tenías si quieres usarlas para Fútbol.
  // Para Voleibol/Pádel, generalmente solo se registra el marcador final de sets).

  return (
    <form onSubmit={handleSubmit} style={{border: '2px solid #333', padding: '20px', borderRadius: '8px', background:'#121212', color:'white'}}>
      <h2 style={{marginTop:0, color: 'var(--gold)'}}>{matchToPlay ? 'Jugar Partido' : 'Programar / Registrar'}</h2>

      {/* SELECTOR DE DEPORTE (Solo si es nuevo) */}
      {!matchToPlay && (
        <div style={{marginBottom:'20px'}}>
          <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Deporte:</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{padding:'10px', borderRadius:'5px', background:'#333', color:'white', border:'1px solid #555'}}>
            <option value="Fútbol 7">⚽ Fútbol 7</option>
            <option value="Fútbol 11">🏟️ Fútbol 11</option>
            <option value="Fútbol Rápido">⚡ Fútbol Rápido</option>
            <option value="Pádel">🎾 Pádel</option>
            <option value="Voleibol">🏐 Voleibol</option>
          </select>
        </div>
      )}

      <div style={{marginBottom: '20px', display: 'flex', gap: '20px'}}>
        <label style={{cursor:'pointer'}}><input type="radio" checked={esProgramado} onChange={() => setEsProgramado(true)} disabled={!!matchToPlay} /> Solo Programar</label>
        <label style={{cursor:'pointer'}}><input type="radio" checked={!esProgramado} onChange={() => setEsProgramado(false)} /> Registrar Resultado</label>
      </div>

      {/* SELECCIÓN DE EQUIPOS (Filtrados) */}
      <div style={{display: 'flex', gap: '10px', marginBottom:'20px'}}>
        <select value={localId} onChange={e=>setLocalId(e.target.value)} disabled={!!matchToPlay} style={{flex:1, padding:'10px', background:'#222', color:'white'}}>
            <option value="">Local</option>
            {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
        </select>
        <span style={{alignSelf:'center'}}>VS</span>
        <select value={visitanteId} onChange={e=>setVisitanteId(e.target.value)} disabled={!!matchToPlay} style={{flex:1, padding:'10px', background:'#222', color:'white'}}>
            <option value="">Visitante</option>
            {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
        </select>
      </div>

      {/* MARCADOR (Adaptable) */}
      {!esProgramado && localId && visitanteId && (
        <div style={{background:'#222', padding:'20px', borderRadius:'8px', textAlign:'center'}}>
           <h3 style={{margin:'0 0 15px 0', color:'#ccc'}}>Marcador Final ({getScoreLabel()})</h3>
           <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'20px'}}>
              <div style={{textAlign:'center'}}>
                <div style={{marginBottom:'5px'}}>{teamLocalObj?.nombre}</div>
                <input type="number" value={scoreLocal} onChange={e=>setScoreLocal(parseInt(e.target.value)||0)} style={{fontSize:'2rem', width:'80px', textAlign:'center', background:'#333', color:'white', border:'none', borderRadius:'5px'}} />
              </div>
              <span style={{fontSize:'2rem'}}>-</span>
              <div style={{textAlign:'center'}}>
                <div style={{marginBottom:'5px'}}>{teamVisitanteObj?.nombre}</div>
                <input type="number" value={scoreVisitante} onChange={e=>setScoreVisitante(parseInt(e.target.value)||0)} style={{fontSize:'2rem', width:'80px', textAlign:'center', background:'#333', color:'white', border:'none', borderRadius:'5px'}} />
              </div>
           </div>
        </div>
      )}

      <label style={{marginTop:'20px', display:'block'}}>Fecha:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{width:'100%', padding:'10px', background:'#333', color:'white', border:'none', marginBottom:'20px'}} />
      
      <button type="submit" style={{width:'100%', padding:'15px', background:'var(--gold)', color:'black', border:'none', fontWeight:'bold', cursor:'pointer'}}>
        GUARDAR
      </button>
    </form>
  );
}

export default CreateMatchForm;