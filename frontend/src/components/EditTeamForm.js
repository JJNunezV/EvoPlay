import React, { useState, useEffect } from 'react';
import api from '../api'; // Usamos nuestra api configurada

function EditTeamForm({ team, onUpdateComplete }) {
  const [formData, setFormData] = useState({ nombre: '', logoUrl: '', jugadores: '' });

  useEffect(() => {
    if (team) {
      // Intentamos manejar si los jugadores vienen como objetos o strings
      let jugadoresString = '';
      if (Array.isArray(team.jugadores)) {
        jugadoresString = team.jugadores
          .map(j => (typeof j === 'object' ? j.nombre : j))
          .join(', ');
      }

      setFormData({
        nombre: team.nombre,
        logoUrl: team.logoUrl || '',
        jugadores: jugadoresString
      });
    }
  }, [team]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convertimos el string de nombres a un arreglo de objetos para la BD
    const jugadoresArray = formData.jugadores.split(',').map(j => ({ nombre: j.trim() }));
    
    const updatedTeam = { 
      ...formData, 
      jugadores: jugadoresArray 
    };

    try {
      // 👇 CAMBIO CLAVE: Usamos api.put y la ruta relativa
      await api.put(`/equipos/${team._id}`, updatedTeam);
      
      alert('Equipo actualizado!');
      onUpdateComplete();
    } catch (error) {
      console.error('Error al actualizar', error);
      alert('No se pudo actualizar el equipo');
    }
  };

  if (!team) return null;

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