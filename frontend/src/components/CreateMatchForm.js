import React, { useState, useEffect } from 'react';
import api from '../api';

function CreateMatchForm({ onMatchCreated }) {
  const [formData, setFormData] = useState({
    equipoLocal: '',
    equipoVisitante: '',
    golesLocal: 0,
    golesVisitante: 0,
    fecha: ''
  });

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // 👇 AQUÍ ESTABA EL CULPABLE. AHORA SÍ TIENE /api
        const response = await api.get('/api/equipos');
        setTeams(response.data);
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
      // 👇 Este también debe tener /api
      await api.post('/api/partidos', formData);
      
      alert('¡Partido registrado exitosamente!');
      onMatchCreated();
      setFormData({
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