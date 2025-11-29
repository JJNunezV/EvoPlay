import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel }) {
  const [allTeams, setAllTeams] = useState([]); 
  const [filteredTeams, setFilteredTeams] = useState([]);
  
  // 1. Aquí decidimos qué deporte estamos jugando
  const [deporte, setDeporte] = useState('Fútbol 7');

  // Datos del partido
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);

  // Cargar equipos
  useEffect(() => {
    const fetch = async () => {
      try { const res = await api.get('/api/equipos'); setAllTeams(res.data); } catch(e){}
    };
    fetch();
  }, []);

  // Filtrar equipos cuando cambias el deporte
  useEffect(() => {
    setFilteredTeams(allTeams.filter(t => t.categoria === deporte));
    if(!matchToPlay) { setLocalId(''); setVisitanteId(''); }
  }, [deporte, allTeams, matchToPlay]);

  // Si es edición, cargar datos
  useEffect(() => {
    if(matchToPlay) {
      setDeporte(matchToPlay.equipoLocal.categoria || 'Fútbol 7');
      setLocalId(matchToPlay.equipoLocal._id || matchToPlay.equipoLocal);
      setVisitanteId(matchToPlay.equipoVisitante._id || matchToPlay.equipoVisitante);
      setFecha(new Date(matchToPlay.fecha).toISOString().split('T')[0]);
      setEsProgramado(false);
      setScoreLocal(matchToPlay.golesLocal);
      setScoreVisitante(matchToPlay.golesVisitante);
    }
  }, [matchToPlay]);

  // ¿Es un deporte de Sets? (Voleibol, Padel, Tenis)
  const esDeporteDeSets = ['Voleibol', 'Pádel', 'Tenis'].includes(deporte);
  const etiquetaPuntos = esDeporteDeSets ? 'Sets Ganados' : 'Goles';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipoLocal: localId, equipoVisitante: visitanteId, fecha, finalizado: !esProgramado,
      golesLocal: esProgramado ? 0 : scoreLocal,
      golesVisitante: esProgramado ? 0 : scoreVisitante
      // Nota: Quitamos detalles complejos por ahora para simplificar la lógica multideporte
    };
    try {
      if(matchToPlay) await api.put(`/api/partidos/${matchToPlay._id}`, payload);
      else await api.post('/api/partidos', payload);
      alert('¡Guardado!');
      onMatchCreated();
      if(onCancel) onCancel();
      if(!matchToPlay) { setLocalId(''); setVisitanteId(''); setFecha(''); setScoreLocal(0); setScoreVisitante(0); }
    } catch(e) { alert('Error al guardar'); }
  };

  return (
    <form onSubmit={handleSubmit} className="widget" style={{border:'2px solid var(--gold)'}}>
      <h2 style={{marginTop:0}}>{matchToPlay ? 'Jugar Partido' : 'Programar / Registrar'}</h2>

      {/* SELECTOR DE DEPORTE (Solo si es nuevo) */}
      {!matchToPlay && (
        <div style={{marginBottom:'20px', background:'#000', padding:'10px', borderRadius:'8px'}}>
          <label style={{color:'var(--gold)'}}>Categoría:</label>
          <select value={deporte} onChange={e=>setDeporte(e.target.value)} style={{width:'100%', marginTop:'5px'}}>
            <option value="Fútbol 7">⚽ Fútbol 7</option>
            <option value="Fútbol 11">🏟️ Fútbol 11</option>
            <option value="Fútbol Rápido">⚡ Fútbol Rápido</option>
            <option value="Pádel">🎾 Pádel</option>
            <option value="Voleibol">🏐 Voleibol</option>
          </select>
        </div>
      )}

      <div style={{display:'flex', gap:'20px', marginBottom:'20px'}}>
        <div style={{flex:1}}>
          <label>Local:</label>
          <select value={localId} onChange={e=>setLocalId(e.target.value)} disabled={!!matchToPlay} style={{width:'100%'}}>
            <option value="">Selecciona...</option>
            {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{flex:1}}>
          <label>Visitante:</label>
          <select value={visitanteId} onChange={e=>setVisitanteId(e.target.value)} disabled={!!matchToPlay} style={{width:'100%'}}>
             <option value="">Selecciona...</option>
             {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* SELECCIÓN DE MODO */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '20px', background:'#222', padding:'10px', borderRadius:'5px'}}>
        <label style={{cursor:'pointer'}}><input type="radio" checked={esProgramado} onChange={() => setEsProgramado(true)} disabled={!!matchToPlay} /> Solo Programar</label>
        <label style={{cursor:'pointer'}}><input type="radio" checked={!esProgramado} onChange={() => setEsProgramado(false)} /> Registrar Resultado</label>
      </div>

      {/* MARCADOR (Solo si no es programado) */}
      {!esProgramado && (
        <div style={{background:'#000', padding:'20px', borderRadius:'8px', marginBottom:'20px', textAlign:'center', border:'1px solid #333'}}>
           <h3 style={{margin:'0 0 10px 0', color:'white'}}>Resultado Final ({etiquetaPuntos})</h3>
           <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'20px'}}>
              <input type="number" value={scoreLocal} onChange={e=>setScoreLocal(parseInt(e.target.value)||0)} style={{fontSize:'2rem', width:'80px', textAlign:'center'}} />
              <span style={{fontSize:'2rem', color:'#fff'}}>-</span>
              <input type="number" value={scoreVisitante} onChange={e=>setScoreVisitante(parseInt(e.target.value)||0)} style={{fontSize:'2rem', width:'80px', textAlign:'center'}} />
           </div>
        </div>
      )}

      <label>Fecha:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{width:'100%', marginBottom:'20px'}} />
      
      <button type="submit" style={{width:'100%'}}>GUARDAR</button>
    </form>
  );
}

export default CreateMatchForm;