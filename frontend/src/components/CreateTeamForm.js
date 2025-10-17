import React, { useState } from 'react';
import api from '../api';

function CreateTeamForm({ onTeamCreated }) { // Se recibe la función aquí
  console.log('¿Recibí la función onTeamCreated?', onTeamCreated);
    const [formData, setFormData] = useState({
    nombre: '',
    logoUrl: '',
    jugadores: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jugadoresArray = formData.jugadores.split(',').map(jugador => ({ nombre: jugador.trim() }));
    const equipoParaEnviar = {
      nombre: formData.nombre,
      logoUrl: formData.logoUrl,
      jugadores: jugadoresArray
    };

    try {
      const response = await api.post('/equipos', equipoParaEnviar);
      alert(`¡Equipo "${response.data.nombre}" creado exitosamente!`);
      setFormData({ nombre: '', logoUrl: '', jugadores: '' });
      
      onTeamCreated(); // <-- ¡LÍNEA CLAVE! Llama a la función para refrescar

    } catch (error) {
      console.error('Error al crear el equipo:', error);
      alert('Hubo un error al crear el equipo.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Añadir Nuevo Equipo</h2>
      {/* ...el resto del formulario... */}
      <label>Nombre del Equipo:</label>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      <label>URL del Logo:</label>
      <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} />
      <label>Jugadores (separados por comas):</label>
      <input type="text" name="jugadores" value={formData.jugadores} onChange={handleChange} />
      <button type="submit">Crear Equipo</button>
    </form>
  );
}

export default CreateTeamForm;