import React, { useState } from 'react';
import axios from 'axios';

function CreateTeamForm({ onTeamCreated }) {
  const [formData, setFormData] = useState({
    nombre: '',
    logoUrl: '',
    jugadores: ''
  });

  const handleChange = (e) => {
    // Esta función se activa cada vez que el usuario escribe en un campo.
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault(); // Previene que la página se recargue.

  // Convertimos el string de jugadores en un arreglo
  const jugadoresArray = formData.jugadores.split(',').map(jugador => jugador.trim());

  const equipoParaEnviar = {
    nombre: formData.nombre,
    logoUrl: formData.logoUrl,
    jugadores: jugadoresArray
  };

  try {
    // Hacemos la petición POST a nuestra API, enviando los datos del formulario.
    const response = await axios.post('http://localhost:5000/api/equipos', equipoParaEnviar);

    // Si todo sale bien, mostramos una alerta y limpiamos el formulario.
    alert(`¡Equipo "${response.data.nombre}" creado exitosamente!`);
    setFormData({ nombre: '', logoUrl: '', jugadores: '' });

    onTeamCreated();

  } catch (error) {
    // Si hay un error, lo mostramos en la consola.
    console.error('Error al crear el equipo:', error);
    alert('Hubo un error al crear el equipo.');
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Añadir Nuevo Equipo</h2>
      <div>
        <label>Nombre del Equipo:</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>URL del Logo:</label>
        <input
          type="text"
          name="logoUrl"
          value={formData.logoUrl}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Jugadores (separados por comas):</label>
        <input
          type="text"
          name="jugadores"
          value={formData.jugadores}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Crear Equipo</button>
    </form>
  );
}

export default CreateTeamForm;