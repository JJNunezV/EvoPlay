import React, { useState, useEffect } from 'react';
import api from '../api';

function EditTeamForm({ team, onUpdateComplete }) {
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    if (team) {
      setNombre(team.nombre);
      setLogoUrl(team.logoUrl || '');
      // Aseguramos que jugadores sea un array
      setJugadores(Array.isArray(team.jugadores) ? team.jugadores : []);
    }
  }, [team]);

  const handlePlayerChange = (index, field, value) => {
    const newJugadores = [...jugadores];
    newJugadores[index][field] = value;
    setJugadores(newJugadores);
  };

  const addPlayer = () => {
    setJugadores([...jugadores, { nombre: '', goles: 0 }]);
  };

  const removePlayer = (index) => {
    const newJugadores = jugadores.filter((_, i) => i !== index);
    setJugadores(newJugadores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedTeam = {
      nombre,
      logoUrl,
      jugadores
    };

    try {
      // 👇 AQUÍ ESTABA EL ERROR: Agregamos '/api' al principio
      await api.put(`/api/equipos/${team._id}`, updatedTeam);
      
      alert('¡Equipo actualizado correctamente!');
      onUpdateComplete();
    } catch (error) {
      console.error('Error al actualizar', error);
      alert('No se pudo actualizar el equipo');
    }
  };

  if (!team) return null;

  return (
    <form onSubmit={handleSubmit} style={{padding: '20px', border: '1px solid #ccc', marginTop: '20px', borderRadius: '8px'}}>
      <h2 style={{marginTop: 0}}>Editar {team.nombre}</h2>
      
      <div style={{marginBottom: '15px'}}>
        <label>Nombre del Equipo:</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required style={{width: '100%', padding: '8px'}} />
      </div>
      
      <div style={{marginBottom: '15px'}}>
        <label>URL del Logo:</label>
        <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{width: '100%', padding: '8px'}} />
      </div>

      <h3>Jugadores</h3>
      {jugadores.map((player, index) => (
        <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Nombre"
            value={player.nombre} 
            onChange={e => handlePlayerChange(index, 'nombre', e.target.value)}
            required
            style={{padding: '5px'}}
          />
          <label>Goles:</label>
          <input 
            type="number" 
            value={player.goles || 0} 
            onChange={e => handlePlayerChange(index, 'goles', parseInt(e.target.value) || 0)}
            style={{width: '60px', padding: '5px'}}
          />
          <button type="button" onClick={() => removePlayer(index)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px'}}>X</button>
        </div>
      ))}
      
      <button type="button" onClick={addPlayer} style={{marginBottom: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px'}}>+ Agregar Jugador</button>
      
      <hr style={{margin: '20px 0'}}/>
      
      <div style={{display: 'flex', gap: '10px'}}>
        <button type="submit" style={{backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer'}}>Guardar Cambios</button>
        <button type="button" onClick={onUpdateComplete} style={{backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer'}}>Cancelar</button>
      </div>
    </form>
  );
}

export default EditTeamForm;