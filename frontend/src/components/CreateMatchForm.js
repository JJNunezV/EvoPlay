import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated, matchToPlay, onCancel }) {
  const [teams, setTeams] = useState([]);
  
  // Datos generales
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');
  const [esProgramado, setEsProgramado] = useState(true);

  // Marcador y Eventos
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);
  const [eventosGol, setEventosGol] = useState([]);

  // Estado temporal para el gol que se está escribiendo
  const [golTemp, setGolTemp] = useState({ 
    jugadorId: '', 
    asistenciaId: '', 
    minuto: '', 
    esAutogol: false 
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/api/equipos');
        setTeams(response.data);
      } catch (error) { console.error("Error cargando equipos"); }
    };
    fetchTeams();

    if (matchToPlay) {
      setLocalId(matchToPlay.equipoLocal._id || matchToPlay.equipoLocal);
      setVisitanteId(matchToPlay.equipoVisitante._id || matchToPlay.equipoVisitante);
      const fechaObj = new Date(matchToPlay.fecha);
      setFecha(fechaObj.toISOString().split('T')[0]);
      setEsProgramado(false); 
    }
  }, [matchToPlay]);

  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // --- LÓGICA PARA AGREGAR UN GOL A LA LISTA ---
  const agregarEvento = (esEquipoLocal) => {
    if (!golTemp.jugadorId || !golTemp.minuto) return alert("Debes seleccionar jugador y minuto");

    const equipoActual = esEquipoLocal ? teamLocalObj : teamVisitanteObj;
    const jugador = equipoActual.jugadores.find(j => j._id === golTemp.jugadorId);
    const asistente = golTemp.asistenciaId ? equipoActual.jugadores.find(j => j._id === golTemp.asistenciaId) : null;

    // Lógica del Marcador:
    // Si es Local y NO es autogol -> Gol para Local
    // Si es Local y SI es autogol -> Gol para Visitante
    if (esEquipoLocal) {
      if (golTemp.esAutogol) setScoreVisitante(s => s + 1);
      else setScoreLocal(s => s + 1);
    } else {
      // Viceversa para visitante
      if (golTemp.esAutogol) setScoreLocal(s => s + 1);
      else setScoreVisitante(s => s + 1);
    }

    const nuevoEvento = {
      jugadorId: golTemp.jugadorId,
      nombreJugador: jugador.nombre,
      asistenciaId: golTemp.asistenciaId || null,
      nombreAsistente: asistente ? asistente.nombre : null,
      minuto: golTemp.minuto,
      equipo: esEquipoLocal ? 'local' : 'visitante',
      esAutogol: golTemp.esAutogol
    };

    setEventosGol([...eventosGol, nuevoEvento]);
    
    // Limpiar inputs temporales
    setGolTemp({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  };

  // --- ELIMINAR UN GOL DE LA LISTA ---
  const eliminarEvento = (index) => {
    const evento = eventosGol[index];
    const esLocal = evento.equipo === 'local';

    // Restar del marcador
    if (esLocal) {
      if (evento.esAutogol) setScoreVisitante(s => s - 1);
      else setScoreLocal(s => s - 1);
    } else {
      if (evento.esAutogol) setScoreLocal(s => s - 1);
      else setScoreVisitante(s => s - 1);
    }

    setEventosGol(eventosGol.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      equipoLocal: localId,
      equipoVisitante: visitanteId,
      fecha: fecha,
      finalizado: !esProgramado,
      golesLocal: esProgramado ? 0 : scoreLocal,
      golesVisitante: esProgramado ? 0 : scoreVisitante,
      detallesGoles: esProgramado ? [] : eventosGol
    };

    try {
      if (matchToPlay) {
        await api.put(`/api/partidos/${matchToPlay._id}`, payload);
        alert('¡Partido finalizado y estadísticas guardadas!');
      } else {
        await api.post('/api/partidos', payload);
        alert(esProgramado ? '¡Partido programado!' : '¡Resultado registrado!');
      }
      
      onMatchCreated();
      if (onCancel) onCancel();
      
      if (!matchToPlay) {
        setLocalId(''); setVisitanteId(''); setFecha('');
        setScoreLocal(0); setScoreVisitante(0); setEventosGol([]);
      }
    } catch (error) {
      alert('Error al guardar');
    }
  };

  // --- COMPONENTE VISUAL PARA LOS CONTROLES ---
  const renderInputZone = (esLocal) => {
    const equipo = esLocal ? teamLocalObj : teamVisitanteObj;
    if (!equipo) return null;

    // Filtramos al jugador seleccionado para que no se pueda asistir a sí mismo
    const posiblesAsistentes = equipo.jugadores ? equipo.jugadores.filter(j => j._id !== golTemp.jugadorId) : [];

    return (
      <div style={{marginBottom: '15px', padding: '15px', background: esLocal ? '#e3f2fd' : '#ffebee', borderRadius:'8px', border: '1px solid rgba(0,0,0,0.1)'}}>
        <h4 style={{margin: '0 0 10px 0', color: '#333'}}>Anotación para {equipo.nombre}</h4>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          
          {/* 1. Quién metió el gol */}
          <div style={{display:'flex', gap:'5px'}}>
            <select style={{flex: 2, padding:'5px'}} 
              value={golTemp.jugadorId} 
              onChange={e => setGolTemp({...golTemp, jugadorId: e.target.value, asistenciaId: ''})}
            >
              <option value="">-- Goleador --</option>
              {equipo.jugadores && equipo.jugadores.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>

            <input type="number" placeholder="Min" style={{width: '50px', padding:'5px'}} 
                   value={golTemp.minuto}
                   onChange={e => setGolTemp({...golTemp, minuto: e.target.value})} />
          </div>

          {/* 2. Asistencia y Autogol */}
          {!golTemp.esAutogol && golTemp.jugadorId && (
            <select style={{width: '100%', padding:'5px'}}
              value={golTemp.asistenciaId} 
              onChange={e => setGolTemp({...golTemp, asistenciaId: e.target.value})}
            >
              <option value="">-- Asistencia (Opcional) --</option>
              {posiblesAsistentes.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
          )}

          <label style={{display: 'flex', alignItems: 'center', cursor:'pointer', fontSize:'0.9rem', color: '#d32f2f'}}>
            <input type="checkbox" 
                   checked={golTemp.esAutogol} 
                   onChange={e => setGolTemp({...golTemp, esAutogol: e.target.checked, asistenciaId: ''})} 
                   style={{marginRight:'5px'}}/>
            Es Autogol (Cuenta al rival)
          </label>

          <button type="button" onClick={() => agregarEvento(esLocal)} 
            style={{marginTop: '5px', width: '100%', background: '#28a745', color: 'white', border:'none', padding:'8px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>
            ⚽ Agregar Gol
          </button>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{border: '2px solid #007bff', padding: '20px', borderRadius: '8px', background:'#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
      <h2 style={{marginTop:0, color: '#007bff'}}>{matchToPlay ? '⚽ Jugar Partido' : '📅 Registrar / Programar'}</h2>

      <div style={{marginBottom: '20px', padding:'10px', background:'#f8f9fa', borderRadius:'5px', display: 'flex', gap: '20px', justifyContent:'center'}}>
        <label style={{cursor:'pointer', fontWeight: esProgramado ? 'bold' : 'normal'}}>
          <input type="radio" checked={esProgramado} onChange={() => setEsProgramado(true)} disabled={!!matchToPlay} /> 
          Solo Programar
        </label>
        <label style={{cursor:'pointer', fontWeight: !esProgramado ? 'bold' : 'normal'}}>
          <input type="radio" checked={!esProgramado} onChange={() => setEsProgramado(false)} /> 
          Registrar Resultado
        </label>
      </div>

      <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
        <div style={{flex: 1}}>
          <label style={{fontWeight:'bold'}}>Local:</label>
          <select value={localId} onChange={e => {setLocalId(e.target.value); setEventosGol([]); setScoreLocal(0); setScoreVisitante(0);}} disabled={!!matchToPlay} style={{width:'100%', padding:'8px'}}>
            <option value="">Selecciona</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{flex: 1}}>
          <label style={{fontWeight:'bold'}}>Visitante:</label>
          <select value={visitanteId} onChange={e => {setVisitanteId(e.target.value); setEventosGol([]); setScoreLocal(0); setScoreVisitante(0);}} disabled={!!matchToPlay} style={{width:'100%', padding:'8px'}}>
            <option value="">Selecciona</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* ZONA DE JUEGO (Solo si no es programado) */}
      {!esProgramado && localId && visitanteId && (
        <div>
           <div style={{textAlign: 'center', fontSize: '3rem', fontWeight: 'bold', margin: '10px 0', color:'#333'}}>
              {scoreLocal} <span style={{color:'#ccc'}}>-</span> {scoreVisitante}
           </div>

           <div style={{display:'flex', gap:'20px', flexWrap:'wrap'}}>
              <div style={{flex:1, minWidth:'250px'}}>{renderInputZone(true)}</div>
              <div style={{flex:1, minWidth:'250px'}}>{renderInputZone(false)}</div>
           </div>

           {/* LISTA DE EVENTOS REGISTRADOS */}
           {eventosGol.length > 0 && (
             <div style={{marginTop:'20px', borderTop:'1px dashed #ccc', paddingTop:'10px'}}>
               <h4>📝 Resumen del Partido:</h4>
               <ul style={{listStyle: 'none', padding: 0}}>
                 {eventosGol.map((ev, i) => (
                   <li key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px', background:'#f9f9f9', marginBottom:'5px', borderRadius:'4px', borderLeft: ev.equipo === 'local' ? '4px solid #2196f3' : '4px solid #f44336'}}>
                     <span>
                       <strong>{ev.minuto}'</strong> {ev.nombreJugador}
                       {ev.esAutogol && <span style={{color: 'red', fontWeight:'bold', marginLeft:'5px'}}>(AUTOGOL)</span>}
                       {ev.nombreAsistente && <span style={{color: 'gray', fontSize:'0.9rem', marginLeft:'5px'}}>👟 {ev.nombreAsistente}</span>}
                     </span>
                     <button type="button" onClick={() => eliminarEvento(i)} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>X</button>
                   </li>
                 ))}
               </ul>
             </div>
           )}
        </div>
      )}

      <label style={{marginTop:'10px', display:'block', fontWeight:'bold'}}>Fecha del Partido:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{marginBottom:'20px', display:'block', padding:'8px'}} />
      
      <div style={{display:'flex', gap:'10px'}}>
        <button type="submit" style={{flex:1, padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer'}}>
          {matchToPlay ? 'Finalizar Partido' : (esProgramado ? 'Guardar en Calendario' : 'Guardar Resultado')}
        </button>
        {matchToPlay && (
          <button type="button" onClick={onCancel} style={{padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default CreateMatchForm;