import React, { useState } from 'react';
import api from '../api';

function CreateTeamForm({ onTeamCreated }) {
  const [nombre, setNombre] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [categoria, setCategoria] = useState('Fútbol 7');
  
  // Ahora jugadores es una lista de objetos desde el principio
  const [jugadores, setJugadores] = useState([]);

  // Función para agregar una fila de jugador vacía
  const addPlayer = () => {
    setJugadores([...jugadores, { nombre: '', posicion: 'Medio', rol: 'Titular' }]);
  };

  // Función para actualizar datos de un jugador específico
  const handlePlayerChange = (index, field, value) => {
    const newJugadores = [...jugadores];
    newJugadores[index][field] = value;
    setJugadores(newJugadores);
  };

  // Función para eliminar un jugador de la lista
  const removePlayer = (index) => {
    const newJugadores = jugadores.filter((_, i) => i !== index);
    setJugadores(newJugadores);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que no haya nombres vacíos
    const jugadoresValidos = jugadores.filter(j => j.nombre.trim() !== '');

    const equipoParaEnviar = {
      nombre,
      logoUrl,
      categoria,
      jugadores: jugadoresValidos
    };

    try {
      await api.post('/api/equipos', equipoParaEnviar);
      alert(`¡Equipo "${nombre}" creado con ${jugadoresValidos.length} jugadores!`);
      
      // Limpiar todo
      setNombre(''); setLogoUrl(''); setCategoria('Fútbol 7'); setJugadores([]);
      onTeamCreated();

    } catch (error) {
      console.error('Error al crear el equipo:', error);
      alert('Hubo un error al crear el equipo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: 'white'}}>
      <h2>Añadir Nuevo Equipo</h2>
      
      <div style={{marginBottom: '10px'}}>
        <label>Categoría:</label>
        <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{width:'100%', padding:'8px'}}>
          <option value="Fútbol 7">Fútbol 7</option>
          <option value="Fútbol 11">Fútbol 11</option>
          <option value="Fútbol Rápido">Fútbol Rápido</option>
          <option value="Pádel">Pádel</option>
          <option value="Voleibol">Voleibol</option>
        </select>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>Nombre del Equipo:</label>
        <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required style={{width:'100%', padding:'8px'}} />
      </div>
      
      <div style={{marginBottom: '20px'}}>
        <label>URL del Logo:</label>
        <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={{width:'100%', padding:'8px'}} />
      </div>
      
      {/* SECCIÓN DE JUGADORES */}
      <h3 style={{borderBottom:'1px solid #eee', paddingBottom:'5px'}}>Plantilla de Jugadores</h3>
      
      {jugadores.length === 0 && <p style={{color:'#777', fontSize:'0.9rem'}}>No has agregado jugadores aún.</p>}

      {jugadores.map((player, index) => (
        <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap'}}>
          {/* Nombre */}
          <input 
            type="text" 
            placeholder="Nombre del Jugador"
            value={player.nombre} 
            onChange={e => handlePlayerChange(index, 'nombre', e.target.value)}
            required
            style={{flex: 3, padding: '8px'}}
          />
          
          {/* Posición */}
          <select 
            value={player.posicion} 
            onChange={e => handlePlayerChange(index, 'posicion', e.target.value)}
            style={{flex: 2, padding: '8px'}}
          >
            <option value="Portero">Portero</option>
            <option value="Defensa">Defensa</option>
            <option value="Medio">Medio</option>
            <option value="Delantero">Delantero</option>
          </select>

          {/* Rol (Titular/Suplente) */}
          <select 
            value={player.rol} 
            onChange={e => handlePlayerChange(index, 'rol', e.target.value)}
            style={{flex: 2, padding: '8px', backgroundColor: player.rol === 'Titular' ? '#d4edda' : '#f8d7da'}}
          >
            <option value="Titular">Titular</option>
            <option value="Suplente">Suplente</option>
          </select>

          {/* Botón Borrar */}
          <button type="button" onClick={() => removePlayer(index)} style={{background:'red', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>
            X
          </button>
        </div>
      ))}

      <button type="button" onClick={addPlayer} style={{marginBottom: '20px', width:'100%', padding:'8px', background:'#28a745', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>
        + Agregar Jugador
      </button>
      
      <button type="submit" style={{width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize:'1.1rem'}}>
        Guardar Equipo
      </button>
    </form>
  );
}

export default CreateTeamForm;