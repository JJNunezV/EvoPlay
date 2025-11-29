import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel, defaultCategory }) {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [categoria, setCategoria] = useState(defaultCategory || 'Fútbol 7');
  
  // Datos
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);

  // Carga inicial
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await api.get('/api/equipos'); // RUTA CORRECTA
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch (e) { console.error("Error equipos"); }
    };
    fetchTeams();
  }, []);

  // Filtrado automático
  useEffect(() => {
    setCategoria(defaultCategory || 'Fútbol 7');
  }, [defaultCategory]);

  useEffect(() => {
    if(teams.length > 0) {
      setFilteredTeams(teams.filter(t => t.categoria === categoria));
    }
  }, [categoria, teams]);

  // Modo Edición
  useEffect(() => {
    if (matchToPlay && matchToPlay.equipoLocal) {
      setLocalId(matchToPlay.equipoLocal._id);
      setVisitanteId(matchToPlay.equipoVisitante._id);
      setFecha(new Date(matchToPlay.fecha).toISOString().split('T')[0]);
      setEsProgramado(false);
      setScoreLocal(matchToPlay.golesLocal);
      setScoreVisitante(matchToPlay.golesVisitante);
    }
  }, [matchToPlay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipoLocal: localId, equipoVisitante: visitanteId, fecha, finalizado: !esProgramado,
      golesLocal: esProgramado ? 0 : scoreLocal, golesVisitante: esProgramado ? 0 : scoreVisitante
    };

    try {
      if (matchToPlay) await api.put(`/api/partidos/${matchToPlay._id}`, payload);
      else await api.post('/api/partidos', payload); // RUTA CORRECTA
      
      alert('¡Guardado!');
      onMatchCreated();
      if(onCancel) onCancel();
      if(!matchToPlay) { setLocalId(''); setVisitanteId(''); setFecha(''); setScoreLocal(0); setScoreVisitante(0); }
    } catch (e) { alert('Error al guardar'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{background:'#1a1a1a', padding:'20px', borderRadius:'8px', border:'1px solid #333', color:'white'}}>
      <h2 style={{marginTop:0, color:'var(--gold)'}}>{matchToPlay ? 'Jugar' : 'Programar'} - {categoria}</h2>
      
      <div style={{marginBottom:'15px', display:'flex', gap:'20px'}}>
         <label><input type="radio" checked={esProgramado} onChange={()=>setEsProgramado(true)} disabled={!!matchToPlay}/> Programar</label>
         <label><input type="radio" checked={!esProgramado} onChange={()=>setEsProgramado(false)}/> Jugar (Resultado)</label>
      </div>

      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <select value={localId} onChange={e=>setLocalId(e.target.value)} disabled={!!matchToPlay} style={{flex:1, padding:'10px', background:'#222', color:'white'}}>
            <option value="">Local</option>
            {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
        </select>
        <select value={visitanteId} onChange={e=>setVisitanteId(e.target.value)} disabled={!!matchToPlay} style={{flex:1, padding:'10px', background:'#222', color:'white'}}>
            <option value="">Visitante</option>
            {filteredTeams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}
        </select>
      </div>

      {!esProgramado && (
         <div style={{display:'flex', justifyContent:'center', gap:'20px', marginBottom:'15px'}}>
            <input type="number" value={scoreLocal} onChange={e=>setScoreLocal(parseInt(e.target.value)||0)} style={{width:'60px', fontSize:'1.5rem', textAlign:'center'}} />
            <span style={{fontSize:'1.5rem'}}>-</span>
            <input type="number" value={scoreVisitante} onChange={e=>setScoreVisitante(parseInt(e.target.value)||0)} style={{width:'60px', fontSize:'1.5rem', textAlign:'center'}} />
         </div>
      )}

      <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} required style={{width:'100%', marginBottom:'15px', padding:'10px'}} />
      <button type="submit" style={{width:'100%', padding:'12px', background:'var(--gold)', border:'none', fontWeight:'bold', cursor:'pointer'}}>GUARDAR</button>
    </form>
  );
}
export default CreateMatchForm;