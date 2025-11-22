import React, { useState, useEffect } from 'react';
import api from '../api';

function EditTeamForm({ team, onUpdateComplete }) {
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [categoria, setCategoria] = useState('Fútbol 7'); // Nuevo estado
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    if (team) {
      setNombre(team.nombre);
      setLogoUrl(team.logoUrl || '');
      setCategoria(team.categoria || 'Fútbol 7'); // Cargar categoría
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
      categoria, // Enviamos categoría
      jugadores
    };

    try {
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
    <form onSubmit={handleSubmit} style={{padding: '20px', border: '1px solid #ccc', marginTop: '20px', borderRadius: '8px', backgroundColor: '#fff3cd'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2 style={{marginTop: 0}}>✏️ Editando: {team.nombre}</h2>
        <button type="button" onClick={onUpdateComplete} style={{background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem'}}>✖</button>
      </div>
      
      <div style={{marginBottom: '15px'}}>
        <label style={{display:'block', fontWeight:'bold'}}>Categoría:</label>
        <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{width: '100%', padding: '8px'}}>
          <option value="Fútbol 7">Fútbol 7</option>
          <option value="Fútbol 11">Fútbol 11</option>
          <option value="Fútbol Rápido">Fútbol Rápido</option>
          <option value="Pádel">Pádel</option>
          <option value="Voleibol">Voleibol</option>
        </select>
      </div>

      <div style={{marginBottom: '15px'}}>
        <label style={{display:'block', fontWeight:'bold'}}>Nombre del Equipo:</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required style={{width: '100%', padding: '8px'}} />
      </div>
      
      <div style={{marginBottom: '15px'}}>
        <label style={{display:'block', fontWeight:'bold'}}>URL del Logo:</label>
        <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{width: '100%', padding: '8px'}} />
      </div>

      <h3 style={{marginTop: '20px'}}>Jugadores y Goles</h3>
      <div style={{maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', background: 'white'}}>
        {jugadores.map((player, index) => (
          <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center'}}>
            <input type="text" placeholder="Nombre" value={player.nombre} onChange={e => handlePlayerChange(index, 'nombre', e.target.value)} required style={{flex: 2, padding: '5px'}} />
            <input type="number" placeholder="Goles" value={player.goles || 0} onChange={e => handlePlayerChange(index, 'goles', parseInt(e.target.value) || 0)} style={{width: '60px', padding: '5px'}} />
            <button type="button" onClick={() => removePlayer(index)} style={{backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px'}}>X</button>
          </div>
        ))}
      </div>
      
      <button type="button" onClick={addPlayer} style={{marginTop: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px'}}>+ Agregar Jugador</button>
      <hr style={{margin: '20px 0'}}/>
      <button type="submit" style={{width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem'}}>Guardar Cambios</button>
    </form>
  );
}

export default EditTeamForm;