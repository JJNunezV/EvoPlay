import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel }) {
  const [teams, setTeams] = useState([]);
  
  // Datos generales
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);

  // Marcador y Listas de Eventos
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);
  const [eventosGol, setEventosGol] = useState([]);
  const [eventosTarjeta, setEventosTarjeta] = useState([]);

  // Inputs temporales para Goles
  const [golTemp, setGolTemp] = useState({ 
    jugadorId: '', 
    asistenciaId: '', 
    minuto: '', 
    esAutogol: false 
  });
  
  // Inputs temporales para Tarjetas
  const [tarjetaTemp, setTarjetaTemp] = useState({ 
    jugadorId: '', 
    tipo: 'Amarilla', 
    minuto: '', 
    motivo: '' 
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try { 
        const res = await api.get('/api/equipos'); 
        setTeams(res.data); 
      } catch (e) { console.error("Error cargando equipos"); }
    };
    fetchTeams();

    if (matchToPlay) {
      setLocalId(matchToPlay.equipoLocal._id || matchToPlay.equipoLocal);
      setVisitanteId(matchToPlay.equipoVisitante._id || matchToPlay.equipoVisitante);
      const fechaObj = new Date(matchToPlay.fecha);
      setFecha(fechaObj.toISOString().split('T')[0]);
      setEsProgramado(false); // Si viene un partido, es para jugarlo
    }
  }, [matchToPlay]);

  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // --- AGREGAR GOL ---
  const agregarEventoGol = (esLocal) => {
    if (!golTemp.jugadorId || !golTemp.minuto) return alert("Falta seleccionar jugador o minuto");
    
    const eq = esLocal ? teamLocalObj : teamVisitanteObj;
    const jug = eq.jugadores.find(j => j._id === golTemp.jugadorId);
    const asist = golTemp.asistenciaId ? eq.jugadores.find(j => j._id === golTemp.asistenciaId) : null;
    
    // Lógica de marcador (Autogol suma al rival)
    if (esLocal) { 
        golTemp.esAutogol ? setScoreVisitante(s=>s+1) : setScoreLocal(s=>s+1); 
    } else { 
        golTemp.esAutogol ? setScoreLocal(s=>s+1) : setScoreVisitante(s=>s+1); 
    }

    setEventosGol([...eventosGol, { 
        ...golTemp, 
        nombreJugador: jug.nombre, 
        nombreAsistente: asist ? asist.nombre : null,
        equipo: esLocal ? 'local' : 'visitante' 
    }]);
    
    // Limpiar inputs
    setGolTemp({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  };

  // --- AGREGAR TARJETA ---
  const agregarTarjeta = (esLocal) => {
    if (!tarjetaTemp.jugadorId) return alert("Elige jugador sancionado");
    const eq = esLocal ? teamLocalObj : teamVisitanteObj;
    const jug = eq.jugadores.find(j => j._id === tarjetaTemp.jugadorId);

    setEventosTarjeta([...eventosTarjeta, { 
      ...tarjetaTemp, 
      nombreJugador: jug.nombre, 
      equipo: esLocal ? 'local' : 'visitante',
      motivo: tarjetaTemp.motivo || 'Falta'
    }]);
    setTarjetaTemp({ jugadorId: '', tipo: 'Amarilla', minuto: '', motivo: '' });
  };

  // --- ELIMINAR EVENTO (Corrección de marcador) ---
  const eliminarGol = (index) => {
    const ev = eventosGol[index];
    const esLocal = ev.equipo === 'local';
    
    if (esLocal) { ev.esAutogol ? setScoreVisitante(s=>s-1) : setScoreLocal(s=>s-1); }
    else { ev.esAutogol ? setScoreLocal(s=>s-1) : setScoreVisitante(s=>s-1); }

    setEventosGol(eventosGol.filter((_, i) => i !== index));
  };

  const eliminarTarjeta = (index) => {
    setEventosTarjeta(eventosTarjeta.filter((_, i) => i !== index));
  };

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
      
      alert(esProgramado ? '¡Partido programado!' : '¡Partido finalizado exitosamente!');
      onMatchCreated();
      if(onCancel) onCancel();
      if(!matchToPlay) { setLocalId(''); setVisitanteId(''); setFecha(''); setEventosGol([]); setEventosTarjeta([]); setScoreLocal(0); setScoreVisitante(0); }
    } catch (e) { alert('Error al guardar'); }
  };

  // --- RENDERIZADOR DE CONTROLES POR EQUIPO ---
  const renderInputZone = (esLocal) => {
    const equipo = esLocal ? teamLocalObj : teamVisitanteObj;
    if (!equipo) return null;
    
    // Filtrar jugadores para asistencia
    const posiblesAsistentes = equipo.jugadores.filter(j => j._id !== golTemp.jugadorId);

    return (
      <div style={{marginBottom:'15px', padding:'15px', background: esLocal?'#1e293b':'#3f1a1a', borderRadius:'8px', border: `1px solid ${esLocal?'#3b82f6':'#ef4444'}`}}>
        <h4 style={{margin:'0 0 10px 0', color: esLocal?'#60a5fa':'#fca5a5'}}>{equipo.nombre}</h4>
        
        {/* SECCIÓN DE GOLES */}
        <div style={{marginBottom:'20px', paddingBottom:'10px', borderBottom:'1px solid #555'}}>
          
          {/* 1. Goleador y Minuto */}
          <div style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
            <select style={{flex:2, padding:'5px'}} value={golTemp.jugadorId} onChange={e=>setGolTemp({...golTemp, jugadorId:e.target.value, asistenciaId:''})}>
              <option value="">-- Goleador --</option>
              {equipo.jugadores.map(j=><option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
            <input type="number" placeholder="Min" style={{width:'50px', padding:'5px'}} value={golTemp.minuto} onChange={e=>setGolTemp({...golTemp, minuto:e.target.value})} />
          </div>

          {/* 2. Asistencia (Si no es autogol) */}
          {!golTemp.esAutogol && (
             <div style={{marginBottom:'5px'}}>
                <select style={{width:'100%', padding:'5px'}} value={golTemp.asistenciaId} onChange={e=>setGolTemp({...golTemp, asistenciaId:e.target.value})}>
                  <option value="">-- Asistencia (Opcional) --</option>
                  {posiblesAsistentes.map(j=><option key={j._id} value={j._id}>{j.nombre}</option>)}
                </select>
             </div>
          )}

          {/* 3. Autogol y Botón */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
             <label style={{color:'#ccc', fontSize:'0.8rem', display:'flex', alignItems:'center', cursor:'pointer'}}>
                <input type="checkbox" checked={golTemp.esAutogol} onChange={e=>setGolTemp({...golTemp, esAutogol:e.target.checked})} style={{marginRight:'5px'}}/> 
                Es Autogol
             </label>
             <button type="button" onClick={()=>agregarEventoGol(esLocal)} style={{background:'#22c55e', border:'none', color:'white', borderRadius:'4px', padding:'5px 15px', cursor:'pointer', fontWeight:'bold'}}>+ GOL</button>
          </div>
        </div>

        {/* SECCIÓN DE TARJETAS */}
        <div>
           <div style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
             <select style={{flex:2, padding:'5px'}} value={tarjetaTemp.jugadorId} onChange={e=>setTarjetaTemp({...tarjetaTemp, jugadorId:e.target.value})}>
                <option value="">-- Sancionado --</option>
                {equipo.jugadores.map(j=><option key={j._id} value={j._id}>{j.nombre}</option>)}
              </select>
              <select style={{width:'80px', padding:'5px'}} value={tarjetaTemp.tipo} onChange={e=>setTarjetaTemp({...tarjetaTemp, tipo:e.target.value})}>
                <option value="Amarilla">🟨</option>
                <option value="Roja">🟥</option>
              </select>
           </div>
           <div style={{display:'flex', gap:'5px'}}>
             <input type="text" placeholder="Motivo (ej: Mano)" value={tarjetaTemp.motivo} onChange={e=>setTarjetaTemp({...tarjetaTemp, motivo:e.target.value})} style={{flex:1, padding:'5px'}} />
             <button type="button" onClick={()=>agregarTarjeta(esLocal)} style={{background:'#eab308', border:'none', color:'black', borderRadius:'4px', padding:'5px 10px', cursor:'pointer'}}>Aplicar</button>
           </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{border: '2px solid #333', padding: '20px', borderRadius: '8px', background:'#121212'}}>
      <h2 style={{marginTop:0, color: '#fff'}}>{matchToPlay ? '⚽ Jugar Partido' : '📅 Registrar / Programar'}</h2>
      
      <div style={{marginBottom: '20px', display: 'flex', gap: '20px'}}>
        <label style={{color:'white', cursor:'pointer'}}><input type="radio" checked={esProgramado} onChange={() => setEsProgramado(true)} disabled={!!matchToPlay} /> Solo Programar</label>
        <label style={{color:'white', cursor:'pointer'}}><input type="radio" checked={!esProgramado} onChange={() => setEsProgramado(false)} /> Registrar Resultado</label>
      </div>

      <div style={{display: 'flex', gap: '10px', marginBottom:'20px'}}>
        <select value={localId} onChange={e=>{setLocalId(e.target.value); setEventosGol([]); setEventosTarjeta([]); setScoreLocal(0); setScoreVisitante(0);}} disabled={!!matchToPlay} style={{flex:1, padding:'10px'}}><option value="">Selecciona Local</option>{teams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}</select>
        <select value={visitanteId} onChange={e=>{setVisitanteId(e.target.value); setEventosGol([]); setEventosTarjeta([]); setScoreLocal(0); setScoreVisitante(0);}} disabled={!!matchToPlay} style={{flex:1, padding:'10px'}}><option value="">Selecciona Visitante</option>{teams.map(t=><option key={t._id} value={t._id}>{t.nombre}</option>)}</select>
      </div>

      {!esProgramado && localId && visitanteId && (
        <>
          <div style={{textAlign:'center', fontSize:'3rem', fontWeight:'bold', color:'white', marginBottom:'20px'}}>
             {scoreLocal} <span style={{color:'#555'}}>-</span> {scoreVisitante}
          </div>
          <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>
             <div style={{flex:1, minWidth:'300px'}}>{renderInputZone(true)}</div>
             <div style={{flex:1, minWidth:'300px'}}>{renderInputZone(false)}</div>
          </div>
          
          {/* RESUMEN DE EVENTOS */}
          {(eventosTarjeta.length > 0 || eventosGol.length > 0) && (
            <div style={{background:'#222', padding:'15px', marginTop:'15px', borderRadius:'8px', border:'1px solid #444'}}>
              <h4 style={{color:'white', marginTop:0, borderBottom:'1px solid #444', paddingBottom:'5px'}}>📝 Resumen del Partido:</h4>
              
              {/* Lista Goles */}
              {eventosGol.map((ev, i) => (
                <div key={i} style={{color:'white', fontSize:'0.9rem', padding:'5px', borderBottom:'1px solid #333', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <span>
                     ⚽ <strong>{ev.minuto}'</strong> {ev.nombreJugador} ({ev.equipo === 'local' ? teamLocalObj?.nombre : teamVisitanteObj?.nombre})
                     {ev.esAutogol && <span style={{color:'red', marginLeft:'5px', fontWeight:'bold'}}>(AUTOGOL)</span>}
                     {ev.nombreAsistente && <span style={{color:'#aaa', marginLeft:'5px'}}>(Asist: {ev.nombreAsistente})</span>}
                   </span>
                   <button type="button" onClick={()=>eliminarGol(i)} style={{color:'red', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>✖</button>
                </div>
              ))}

              {/* Lista Tarjetas */}
              {eventosTarjeta.map((t,i) => (
                <div key={i} style={{color:'#ccc', fontSize:'0.9rem', padding:'5px', borderBottom:'1px solid #333', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span>
                    {t.tipo === 'Amarilla' ? '🟨' : '🟥'} <strong>{t.nombreJugador}</strong> ({t.equipo === 'local' ? teamLocalObj?.nombre : teamVisitanteObj?.nombre}): <span style={{fontStyle:'italic'}}>{t.motivo}</span>
                  </span>
                  <button type="button" onClick={()=>eliminarTarjeta(i)} style={{color:'red', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>✖</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <label style={{marginTop:'20px', display:'block', fontWeight:'bold', color:'white'}}>Fecha:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{marginBottom:'20px', display:'block', width:'100%', padding:'10px'}} />
      
      <div style={{display:'flex', gap:'10px'}}>
        <button type="submit" style={{flex:1, padding: '15px', background: 'var(--gold)', color:'black', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight:'bold'}}>
          {matchToPlay ? 'FINALIZAR PARTIDO' : (esProgramado ? 'PROGRAMAR PARTIDO' : 'REGISTRAR RESULTADO')}
        </button>
        {matchToPlay && (
          <button type="button" onClick={onCancel} style={{padding: '15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default CreateMatchForm;