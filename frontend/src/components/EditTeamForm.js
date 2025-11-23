import React, { useState, useEffect } from 'react';
import api from '../api';

function EditTeamForm({ team, onUpdateComplete }) {
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [categoria, setCategoria] = useState('');
  const [jugadores, setJugadores] = useState([]);

  useEffect(() => {
    if (team) {
      setNombre(team.nombre);
      setLogoUrl(team.logoUrl || '');
      setCategoria(team.categoria || 'Fútbol 7');
      // Mapeamos para asegurar que tengan los campos nuevos si vienen de versión vieja
      const jugadoresConDatos = (team.jugadores || []).map(j => ({
        ...j,
        posicion: j.posicion || 'Medio',
        rol: j.rol || 'Titular'
      }));
      setJugadores(jugadoresConDatos);
    }
  }, [team]);

  const handlePlayerChange = (index, field, value) => {
    const newJugadores = [...jugadores];
    newJugadores[index][field] = value;
    setJugadores(newJugadores);
  };

  const addPlayer = () => {
    setJugadores([...jugadores, { nombre: '', goles: 0, posicion: 'Medio', rol: 'Titular' }]);
  };

  const removePlayer = (index) => {
    const newJugadores = jugadores.filter((_, i) => i !== index);
    setJugadores(newJugadores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedTeam = { nombre, logoUrl, categoria, jugadores };

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
      
      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <div style={{flex:1}}>
            <label>Nombre:</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required style={{width: '100%', padding: '8px'}} />
        </div>
        <div style={{flex:1}}>
            <label>Categoría:</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{width: '100%', padding: '8px'}}>
                <option value="Fútbol 7">Fútbol 7</option>
                <option value="Fútbol 11">Fútbol 11</option>
                <option value="Fútbol Rápido">Fútbol Rápido</option>
                <option value="Pádel">Pádel</option>
                <option value="Voleibol">Voleibol</option>
            </select>
        </div>
      </div>
      
      <div style={{marginBottom: '15px'}}>
        <label>URL del Logo:</label>
        <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{width: '100%', padding: '8px'}} />
      </div>

      <h3>Jugadores</h3>
      <div style={{maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', background: 'white'}}>
        {jugadores.map((player, index) => (
          <div key={index} style={{display: 'flex', gap: '5px', marginBottom: '10px', alignItems: 'center', borderBottom:'1px solid #eee', paddingBottom:'5px'}}>
            <input type="text" placeholder="Nombre" value={player.nombre} onChange={e => handlePlayerChange(index, 'nombre', e.target.value)} required style={{flex: 3, padding: '5px'}} />
            
            <select value={player.posicion} onChange={e => handlePlayerChange(index, 'posicion', e.target.value)} style={{flex: 2, padding: '5px'}}>
                <option value="Portero">POR</option>
                <option value="Defensa">DEF</option>
                <option value="Medio">MED</option>
                <option value="Delantero">DEL</option>
            </select>

            <select value={player.rol} onChange={e => handlePlayerChange(index, 'rol', e.target.value)} style={{flex: 2, padding: '5px', background: player.rol==='Titular'?'#d4edda':'#f8d7da'}}>
                <option value="Titular">Titular</option>
                <option value="Suplente">Suplente</option>
            </select>

            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                <small>Goles</small>
                <input type="number" value={player.goles || 0} onChange={e => handlePlayerChange(index, 'goles', parseInt(e.target.value) || 0)} style={{width: '40px', padding: '5px'}} />
            </div>

            <button type="button" onClick={() => removePlayer(index)} style={{background:'red', color:'white', border:'none', padding:'5px', borderRadius:'4px', cursor:'pointer'}}>X</button>
          </div>
        ))}
      </div>
      
      <button type="button" onClick={addPlayer} style={{marginTop: '10px', background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px'}}>+ Agregar Jugador</button>
      <hr/>
      <button type="submit" style={{width: '100%', background: '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem'}}>Guardar Cambios</button>
    </form>
  );
}

export default EditTeamForm;