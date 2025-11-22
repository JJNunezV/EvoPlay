import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated }) {
  const [teams, setTeams] = useState([]);
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');

  // Marcadores calculados automáticamente
  const [scoreLocal, setScoreLocal] = useState(0);
  const [scoreVisitante, setScoreVisitante] = useState(0);

  // Lista de eventos (goles)
  const [eventosGol, setEventosGol] = useState([]);

  // Inputs temporales
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
  }, []);

  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // Función para procesar el gol
  const agregarEvento = (esEquipoLocal) => {
    if (!golTemp.jugadorId || !golTemp.minuto) return alert("Elige jugador y minuto");

    const equipoActual = esEquipoLocal ? teamLocalObj : teamVisitanteObj;
    const jugador = equipoActual.jugadores.find(j => j._id === golTemp.jugadorId);
    const asistente = golTemp.asistenciaId ? equipoActual.jugadores.find(j => j._id === golTemp.asistenciaId) : null;

    // LÓGICA DEL MARCADOR
    if (esEquipoLocal) {
      // Si el local mete autogol, punto para el visitante. Si no, punto para local.
      if (golTemp.esAutogol) setScoreVisitante(scoreVisitante + 1);
      else setScoreLocal(scoreLocal + 1);
    } else {
      // Si el visitante mete autogol, punto para el local.
      if (golTemp.esAutogol) setScoreLocal(scoreLocal + 1);
      else setScoreVisitante(scoreVisitante + 1);
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
    
    // Resetear inputs temporales
    setGolTemp({ jugadorId: '', asistenciaId: '', minuto: '', esAutogol: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const partidoData = {
      equipoLocal: localId,
      equipoVisitante: visitanteId,
      golesLocal: scoreLocal,
      golesVisitante: scoreVisitante,
      fecha: fecha,
      detallesGoles: eventosGol
    };

    try {
      await api.post('/api/partidos', partidoData);
      alert('¡Partido registrado exitosamente!');
      onMatchCreated();
      // Limpiar todo
      setLocalId(''); setVisitanteId(''); setFecha('');
      setScoreLocal(0); setScoreVisitante(0); setEventosGol([]);
    } catch (error) {
      alert('Error al registrar partido');
    }
  };

  // Componente auxiliar para renderizar la zona de inputs
  const renderInputZone = (esLocal) => {
    const equipo = esLocal ? teamLocalObj : teamVisitanteObj;
    if (!equipo) return null;

    // Filtramos para que no se pueda asistir a sí mismo
    const posiblesAsistentes = equipo.jugadores.filter(j => j._id !== golTemp.jugadorId);

    return (
      <div style={{marginBottom: '15px', padding: '10px', background: esLocal ? '#e3f2fd' : '#ffebee', borderRadius:'5px'}}>
        <h4 style={{margin: '0 0 10px 0'}}>Evento {equipo.nombre}</h4>
        
        <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          {/* Selector Jugador */}
          <select style={{flex: 2}} 
            value={golTemp.jugadorId} 
            onChange={e => setGolTemp({...golTemp, jugadorId: e.target.value, asistenciaId: ''})} // Reset asistencia al cambiar jugador
          >
            <option value="">¿Quién anotó?</option>
            {equipo.jugadores.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
          </select>

          {/* Minuto */}
          <input type="number" placeholder="Min" style={{width: '50px'}} 
                 value={golTemp.minuto}
                 onChange={e => setGolTemp({...golTemp, minuto: e.target.value})} />

          {/* Checkbox Autogol */}
          <label style={{display: 'flex', alignItems: 'center', cursor:'pointer', fontSize:'0.9rem'}}>
            <input type="checkbox" 
                   checked={golTemp.esAutogol} 
                   onChange={e => setGolTemp({...golTemp, esAutogol: e.target.checked, asistenciaId: ''})} />
            Autogol
          </label>
        </div>

        {/* Selector Asistencia (Solo si no es autogol y ya eligió jugador) */}
        {!golTemp.esAutogol && golTemp.jugadorId && (
          <div style={{marginTop: '10px'}}>
            <select style={{width: '100%'}}
              value={golTemp.asistenciaId} 
              onChange={e => setGolTemp({...golTemp, asistenciaId: e.target.value})}
            >
              <option value="">¿Hubo asistencia? (Opcional)</option>
              {posiblesAsistentes.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
          </div>
        )}

        <button type="button" onClick={() => agregarEvento(esLocal)} 
          style={{marginTop: '10px', width: '100%', background: '#28a745', color: 'white', border:'none', padding:'5px', cursor:'pointer'}}>
          + Agregar Evento
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} style={{border: '1px solid #ddd', padding: '20px', borderRadius: '8px'}}>
      <h2>Registrar Partido</h2>

      {/* Selección de Equipos */}
      <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
        <div style={{flex: 1}}>
          <label>Local:</label>
          <select value={localId} onChange={e => {setLocalId(e.target.value); setEventosGol([]); setScoreLocal(0); setScoreVisitante(0);}} style={{width: '100%'}}>
            <option value="">Selecciona Equipo</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{flex: 1}}>
          <label>Visitante:</label>
          <select value={visitanteId} onChange={e => {setVisitanteId(e.target.value); setEventosGol([]); setScoreLocal(0); setScoreVisitante(0);}} style={{width: '100%'}}>
            <option value="">Selecciona Equipo</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Marcador en Tiempo Real */}
      <div style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px'}}>
        {scoreLocal} - {scoreVisitante}
      </div>

      {/* Zonas de Input */}
      <div style={{display: 'flex', gap: '20px'}}>
        <div style={{flex: 1}}>{renderInputZone(true)}</div>
        <div style={{flex: 1}}>{renderInputZone(false)}</div>
      </div>

      {/* Lista de Eventos */}
      {eventosGol.length > 0 && (
        <div style={{background: '#f9f9f9', padding: '10px', borderRadius: '5px', marginBottom: '20px'}}>
          <h4>Resumen del Partido:</h4>
          <ul style={{listStyle: 'none', padding: 0}}>
            {eventosGol.map((ev, i) => (
              <li key={i} style={{marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom:'5px'}}>
                ⏱ <strong>{ev.minuto}'</strong> - {ev.nombreJugador} ({ev.equipo === 'local' ? teamLocalObj?.nombre : teamVisitanteObj?.nombre})
                {ev.esAutogol && <span style={{color: 'red', fontWeight:'bold'}}> (AUTOGOL)</span>}
                {ev.nombreAsistente && <span style={{color: 'gray'}}> 👟 Asist: {ev.nombreAsistente}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <label>Fecha del Partido:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required style={{marginBottom: '20px', display: 'block'}} />
      
      <button type="submit" style={{width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer'}}>
        Finalizar y Guardar Partido
      </button>
    </form>
  );
}

export default CreateMatchForm;