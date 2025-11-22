import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated }) {
  const [teams, setTeams] = useState([]);
  
  // Datos generales del partido
  const [localId, setLocalId] = useState('');
  const [visitanteId, setVisitanteId] = useState('');
  const [fecha, setFecha] = useState('');

  // Listas de goles (Arrays)
  const [golesLocalList, setGolesLocalList] = useState([]);
  const [golesVisitanteList, setGolesVisitanteList] = useState([]);

  // Inputs temporales para agregar un gol
  const [golTemp, setGolTemp] = useState({ jugadorId: '', minuto: '' });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/api/equipos');
        setTeams(response.data);
      } catch (error) { console.error("Error cargando equipos"); }
    };
    fetchTeams();
  }, []);

  // Helpers para encontrar el objeto del equipo seleccionado
  const teamLocalObj = teams.find(t => t._id === localId);
  const teamVisitanteObj = teams.find(t => t._id === visitanteId);

  // Función para agregar un gol a la lista visual
  const agregarGol = (esLocal) => {
    if (!golTemp.jugadorId || !golTemp.minuto) return alert("Elige jugador y minuto");

    const equipoObj = esLocal ? teamLocalObj : teamVisitanteObj;
    const jugadorObj = equipoObj.jugadores.find(j => j._id === golTemp.jugadorId);

    const nuevoGol = {
      jugadorId: golTemp.jugadorId,
      nombreJugador: jugadorObj.nombre,
      minuto: golTemp.minuto,
      equipo: esLocal ? 'local' : 'visitante'
    };

    if (esLocal) setGolesLocalList([...golesLocalList, nuevoGol]);
    else setGolesVisitanteList([...golesVisitanteList, nuevoGol]);

    // Limpiar inputs
    setGolTemp({ jugadorId: '', minuto: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Juntamos todos los goles en una sola lista para el backend
    const todosLosGoles = [...golesLocalList, ...golesVisitanteList];

    const partidoData = {
      equipoLocal: localId,
      equipoVisitante: visitanteId,
      golesLocal: golesLocalList.length,     // Se calcula solo
      golesVisitante: golesVisitanteList.length, // Se calcula solo
      fecha: fecha,
      detallesGoles: todosLosGoles
    };

    try {
      await api.post('/api/partidos', partidoData);
      alert('¡Partido y estadísticas registrados!');
      onMatchCreated();
      // Resetear todo
      setLocalId(''); setVisitanteId(''); setFecha('');
      setGolesLocalList([]); setGolesVisitanteList([]);
    } catch (error) {
      alert('Error al registrar partido');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{border: '1px solid #ddd', padding: '20px', borderRadius: '8px'}}>
      <h2>Registrar Partido Detallado</h2>

      {/* SELECCIÓN DE EQUIPOS */}
      <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
        <div style={{flex: 1}}>
          <label>Local:</label>
          <select value={localId} onChange={e => setLocalId(e.target.value)} required style={{width: '100%'}}>
            <option value="">Selecciona Equipo</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
        <div style={{flex: 1}}>
          <label>Visitante:</label>
          <select value={visitanteId} onChange={e => setVisitanteId(e.target.value)} required style={{width: '100%'}}>
            <option value="">Selecciona Equipo</option>
            {teams.map(t => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* SECCIÓN DE GOLES LOCAL */}
      {localId && (
        <div style={{marginBottom: '20px', background: '#f0f8ff', padding: '10px'}}>
          <h4>Goles {teamLocalObj?.nombre} (Total: {golesLocalList.length})</h4>
          <div style={{display: 'flex', gap: '5px'}}>
            <select onChange={e => setGolTemp({...golTemp, jugadorId: e.target.value})} style={{flex: 2}}>
              <option value="">Jugador que anotó...</option>
              {teamLocalObj?.jugadores.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
            <input type="number" placeholder="Min" style={{width: '60px'}} 
                   onChange={e => setGolTemp({...golTemp, minuto: e.target.value})} />
            <button type="button" onClick={() => agregarGol(true)}>+ Gol</button>
          </div>
          <ul>
            {golesLocalList.map((g, i) => <li key={i}>⚽ {g.nombreJugador} ({g.minuto}')</li>)}
          </ul>
        </div>
      )}

      {/* SECCIÓN DE GOLES VISITANTE */}
      {visitanteId && (
        <div style={{marginBottom: '20px', background: '#fff0f0', padding: '10px'}}>
          <h4>Goles {teamVisitanteObj?.nombre} (Total: {golesVisitanteList.length})</h4>
          <div style={{display: 'flex', gap: '5px'}}>
            <select onChange={e => setGolTemp({...golTemp, jugadorId: e.target.value})} style={{flex: 2}}>
              <option value="">Jugador que anotó...</option>
              {teamVisitanteObj?.jugadores.map(j => <option key={j._id} value={j._id}>{j.nombre}</option>)}
            </select>
            <input type="number" placeholder="Min" style={{width: '60px'}} 
                   onChange={e => setGolTemp({...golTemp, minuto: e.target.value})} />
            <button type="button" onClick={() => agregarGol(false)}>+ Gol</button>
          </div>
          <ul>
            {golesVisitanteList.map((g, i) => <li key={i}>⚽ {g.nombreJugador} ({g.minuto}')</li>)}
          </ul>
        </div>
      )}

      <label>Fecha:</label>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required />
      
      <button type="submit" style={{marginTop: '20px', width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none'}}>
        Finalizar Partido
      </button>
    </form>
  );
}

export default CreateMatchForm;