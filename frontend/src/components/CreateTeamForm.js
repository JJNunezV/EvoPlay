import React, { useState } from 'react';
import api from '../api';

function CreateTeamForm({ onTeamCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    logoUrl: '',
    categoria: 'Fútbol 7', // Valor por defecto
    jugadores: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jugadoresArray = formData.jugadores.split(',').map(jugador => ({ nombre: jugador.trim() }));
    
    const equipoParaEnviar = {
      nombre: formData.nombre,
      logoUrl: formData.logoUrl,
      categoria: formData.categoria, // Enviamos la categoría
      jugadores: jugadoresArray
    };

    try {
      await api.post('/api/equipos', equipoParaEnviar);
      
      alert(`¡Equipo "${formData.nombre}" de ${formData.categoria} creado!`);
      setFormData({ nombre: '', logoUrl: '', categoria: 'Fútbol 7', jugadores: '' });
      onTeamCreated();

    } catch (error) {
      console.error('Error al crear el equipo:', error);
      alert('Hubo un error al crear el equipo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
      <h2>Añadir Nuevo Equipo</h2>
      
      <div style={{marginBottom: '10px'}}>
        <label>Deporte / Categoría:</label>
        <select 
          name="categoria" 
          value={formData.categoria} 
          onChange={handleChange}
          style={{width: '100%', padding: '8px', borderRadius: '4px'}}
        >
          <option value="Fútbol 7">Fútbol 7</option>
          <option value="Fútbol 11">Fútbol 11</option>
          <option value="Fútbol Rápido">Fútbol Rápido</option>
          <option value="Pádel">Pádel</option>
          <option value="Voleibol">Voleibol</option>
        </select>
      </div>

      <div style={{marginBottom: '10px'}}>
        <label>Nombre del Equipo:</label>
        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{width: '100%', padding: '8px'}} />
      </div>
      
      <div style={{marginBottom: '10px'}}>
        <label>URL del Logo:</label>
        <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} style={{width: '100%', padding: '8px'}} />
      </div>
      
      <div style={{marginBottom: '10px'}}>
        <label>Jugadores (separados por comas):</label>
        <input type="text" name="jugadores" value={formData.jugadores} onChange={handleChange} style={{width: '100%', padding: '8px'}} />
      </div>
      
      <button type="submit" style={{width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Crear Equipo</button>
    </form>
  );
}

export default CreateTeamForm;