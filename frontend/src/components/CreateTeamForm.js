import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel }) {
  const [teams, setTeams] = useState([]);
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);

  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);
  const [eventosGol, setEventosGol] = useState([]);
  const [eventosTarjeta, setEventosTarjeta] = useState([]); // <-- NUEVO

  // Inputs temporales
  const [golTemp, setGolTemp] = useState({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  const [tarjetaTemp, setTarjetaTemp] = useState({ jugadorId: '', tipo: 'Amarilla', minuto: '' }); // <-- NUEVO

  useEffect(() => {
    const fetchTeams = async () => {
      try { const res = await api.get('/api/equipos'); setTeams(res.data); } catch (e) {}
    };
    fetchTeams();
    if (matchToPlay) {
      setLocalId(matchToPlay.equipoLocal._id || matchToPlay.equipoLocal);
      setVisitanteId(matchToPlay.equipoVisitante._id || matchToPlay.equipoVisitante);
      setFecha(new Date(matchToPlay.fecha).toISOString().split('T')[0]);
      setEsProgramado(false);
    }
  }, [matchToPlay]);

  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // --- AGREGAR GOL ---
  const agregarEventoGol = (esLocal) => {
    if (!golTemp.jugadorId) return alert("Elige jugador");
    const eq = esLocal ? teamLocalObj : teamVisitanteObj;
    const jug = eq.jugadores.find(j => j._id === golTemp.jugadorId);
    
    if (esLocal) { golTemp.esAutogol ? setScoreVisitante(s=>s+1) : setScoreLocal(s=>s+1); }
    else { golTemp.esAutogol ? setScoreLocal(s=>s+1) : setScoreVisitante(s=>s+1); }

    setEventosGol([...eventosGol, { ...golTemp, nombreJugador: jug.nombre, equipo: esLocal?'local':'visitante' }]);
    setGolTemp({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  };

  // --- AGREGAR TARJETA ---
  const agregarTarjeta = (esLocal) => {
    if (!tarjetaTemp.jugadorId) return alert("Elige jugador");
    const eq = esLocal ? teamLocalObj : teamVisitanteObj;
    const jug = eq.jugadores.find(j => j._id === tarjetaTemp.jugadorId);

    setEventosTarjeta([...eventosTarjeta, { ...tarjetaTemp, nombreJugador: jug.nombre, equipo: esLocal?'local':'visitante' }]);
    setTarjetaTemp({ jugadorId: '', tipo: 'Amarilla', minuto: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipoLocal: localId, equipoVisitante: visitanteId, fecha, finalizado: !esProgramado,
      golesLocal: esProgramado ? 0 : scoreLocal,
      golesVisitante: esProgramado ? 0 : scoreVisitante,
      detallesGoles: esProgramado ? [] : eventosGol,
      detallesTarjetas: esProgramado ? [] : eventosTarjeta // <-- ENVIAMOS TARJETAS
    };
    try {
      if (matchToPlay) await api.put(`/api/partidos/${matchToPlay._id}`, payload);
      else await api.post('/api/partidos', payload);
      alert('¡Guardado!');
      onMatchCreated();
      if(onCancel) onCancel();
      if(!matchToPlay) { setLocalId(''); setVisitanteId(''); setFecha(''); setEventosGol([]); setEventosTarjeta([]); }
    } catch (e) { alert('Error'); }
  };

  // Renderizador de controles por equipo
  const renderInputZone = (esLocal) => {
    const equipo = esLocal ? teamLocalObj : teamVisitanteObj;
    if (!equipo) return null;
    return (
      <div style={{marginBottom:'15px', padding:'15px', background: esLocal?'#1e293b':'#3f1a1a', borderRadius:'8px', border: `1px solid ${esLocal?'#3b82f6':'#ef4444'}`}}>
        <h4 style={{margin:'0 0 10px 0', color: esLocal?'#60a5fa':'#fca5a5'}}>{equipo.nombre}</h4>
        
        {/* GOLES */}
        <div style={{marginBottom:'15px'}}>
          <div style={{display:'flex', gap:'5px'}}>
            <select style={{flex:2}} value={golTemp.jugadorId} onChange={e=>setGolTemp({...golTemp, jugadorId:e.target.value})}>
              <option value="">-- Goleador --</option>
              {equipo.jugadores.map(j=><option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
            <button type="button" onClick={()=>agregarEventoGol(esLocal)} style={{background:'#22c55e', border:'none', color:'white', borderRadius:'4px'}}>⚽</button>
          </div>
        </div>

        {/* TARJETAS */}
        <div style={{display:'flex', gap:'5px', borderTop:'1px dashed #555', paddingTop:'10px'}}>
           <select style={{flex:2}} value={tarjetaTemp.jugadorId} onChange={e=>setTarjetaTemp({...tarjetaTemp, jugadorId:e.target.value})}>
              <option value="">-- Sancionado --</option>
              {equipo.jugadores.map(j=><option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
            <select style={{width:'80px'}} value={tarjetaTemp.tipo} onChange={e=>setTarjetaTemp({...tarjetaTemp, tipo:e.target.value})}>
              <option value="Amarilla">🟨</option>
              <option value="Roja">🟥</option>
            </select>
            <button type="button" onClick={()=>agregarTarjeta(esLocal)} style={{background:'#eab308', border:'none', color:'black', borderRadius:'4px'}}>Tarjeta</button>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{border: '2px solid #333', padding: '20px', borderRadius: '8px', background:'#121212'}}>
      <h2 style={{marginTop:0, color: '#fff'}}>{matchToPlay ? '⚽ Jugar' : '📅 Programar'}</h2>
      
      <div style={{marginBottom: '20px', display: 'flex', gap: '20px'}}>
        <label style={{color:'white'}}><input type="radio" checked={esProgramado} onChange={() => setEsProgramado(true)} disabled={!!matchToPlay} /> Programar</label>
        <label style={{color:'white'}}><input type="radio" checked={!esProgramado} onChange={() => setEsProgramado(false)} /> Jugar</label>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom:'20px'}}>
        <select value={localId} onChange={e=>{setLocalId(e.target.value); setEventosGol([]); setEventosTarjeta([]);}} disabled={!!matchToPlay} style={{flex:1}}><option value="">Local</option>{teams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}</select>
        <select value={visitanteId} onChange={e=>{setVisitanteId(e.target.value); setEventosGol([]); setEventosTarjeta([]);}} disabled={!!matchToPlay} style={{flex:1}}><option value="">Visitante</option>{teams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}</select>
      </div>

      {!esProgramado && localId && visitanteId && (
        <>
          <div style={{textAlign:'center', fontSize:'3rem', fontWeight:'bold', color:'white'}}>{scoreLocal} - {scoreVisitante}</div>
          <div style={{display:'flex', gap:'20px'}}>{renderInputZone(true)}{renderInputZone(false)}</div>
          
          {/* Resumen de Tarjetas */}
          {eventosTarjeta.length > 0 && (
            <div style={{background:'#222', padding:'10px', marginTop:'10px', borderRadius:'5px'}}>
              <strong style={{color:'white'}}>Tarjetas:</strong>
              {eventosTarjeta.map((t,i) => (
                <div key={i} style={{color:'#ccc', fontSize:'0.9rem'}}>
                  {t.tipo === 'Amarilla' ? '🟨' : '🟥'} {t.nombreJugador} ({t.equipo})
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{marginTop:'20px', display:'block', width:'100%'}} />
      <button type="submit" style={{marginTop:'10px', width:'100%', padding:'15px', background:'var(--gold)', border:'none', fontWeight:'bold'}}>GUARDAR</button>
    </form>
  );
}
export default CreateMatchForm;