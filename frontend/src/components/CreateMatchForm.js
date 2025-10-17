import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated }) {
  // Estado para guardar los datos del formulario
  const [formData, setFormData] = useState({
    equipoLocal: '',
    equipoVisitante: '',
    golesLocal: 0,
    golesVisitante: 0,
    fecha: ''
  });

  // Estado para guardar la lista de equipos disponibles
  const [teams, setTeams] = useState([]);

  // Lógica para obtener los equipos de la API (la llenaremos en el siguiente paso)
  useEffect(() => {
  const fetchTeams = async () => {
    try {
      const response = await api.get('/equipos');
      setTeams(response.data); // Guardamos la lista de equipos en nuestro estado
    } catch (error) {
      console.error("No se pudieron cargar los equipos", error);
    }
  };
  fetchTeams();
}, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post('http://localhost:5000/api/partidos', formData);
    alert('¡Partido registrado exitosamente!');
    onMatchCreated(); // ¡Llama a la función para refrescar la lista!
    setFormData({ // Limpia el formulario
      equipoLocal: '',
      equipoVisitante: '',
      golesLocal: 0,
      golesVisitante: 0,
      fecha: ''
    });
  } catch (error) {
    console.error('Error al registrar el partido', error);
    alert('Hubo un error al registrar el partido.');
  }
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrar Nuevo Partido</h2>
      <div>
        <label>Equipo Local:</label>
        <select name="equipoLocal" value={formData.equipoLocal} onChange={handleChange} required>
  <option value="">Selecciona un equipo</option>
  {teams.map(team => (
    <option key={team._id} value={team._id}>{team.nombre}</option>
  ))}
</select>
      </div>
      <div>
        <label>Equipo Visitante:</label>
        <select name="equipoVisitante" value={formData.equipoVisitante} onChange={handleChange} required>
  <option value="">Selecciona un equipo</option>
  {teams.map(team => (
    <option key={team._id} value={team._id}>{team.nombre}</option>
  ))}
</select>
      </div>
      <div>
        <label>Goles Local:</label>
        <input type="number" name="golesLocal" value={formData.golesLocal} onChange={handleChange} />
      </div>
      <div>
        <label>Goles Visitante:</label>
        <input type="number" name="golesVisitante" value={formData.golesVisitante} onChange={handleChange} />
      </div>
      <div>
        <label>Fecha del Partido:</label>
        <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
      </div>
      <button type="submit">Registrar Partido</button>
    </form>
  );
}

export default CreateMatchForm;