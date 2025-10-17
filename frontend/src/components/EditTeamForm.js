import React, { useState, useEffect } from 'react';
import api from '../api';

function EditTeamForm({ team, onUpdateComplete }) {
  const [formData, setFormData] = useState({ nombre: '', logoUrl: '', jugadores: '' });

  // Este useEffect actualiza el formulario si el equipo a editar cambia.
  useEffect(() => {
    if (team) {
      setFormData({
        nombre: team.nombre,
        logoUrl: team.logoUrl || '',
        jugadores: team.jugadores.join(', ') // Convertimos el array a string
      });
    }
  }, [team]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const jugadoresArray = formData.jugadores.split(',').map(j => j.trim());
    const updatedTeam = { ...formData, jugadores: jugadoresArray };

    try {
      await axios.put(`http://localhost:5000/api/equipos/${team._id}`, updatedTeam);
      alert('Equipo actualizado!');
      onUpdateComplete(); // Avisa a App.js que terminamos para que refresque la lista.
    } catch (error) {
      console.error('Error al actualizar', error);
      alert('No se pudo actualizar el equipo');
    }
  };

  if (!team) return null; // Si no hay equipo para editar, no muestra nada.

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editando: {team.nombre}</h2>
      <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
      <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} />
      <input type="text" name="jugadores" value={formData.jugadores} onChange={handleChange} />
      <button type="submit">Guardar Cambios</button>
      <button type="button" onClick={onUpdateComplete}>Cancelar</button>
    </form>
  );
}

export default EditTeamForm;