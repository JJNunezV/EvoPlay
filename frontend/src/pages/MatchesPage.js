import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm'; // <-- Importado

function MatchesPage() {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => { // <-- Función para refrescar
    try {
      const response = await axios.get('http://localhost:5000/api/partidos');
      setMatches(response.data);
    } catch (error) {
      console.error("Error al obtener los partidos", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div>
      <h1>Resultados de Partidos</h1>
      <CreateMatchForm onMatchCreated={fetchMatches} /> {/* <-- Formulario añadido */}
      <div style={{ marginTop: '20px' }}> {/* Añadido para dar espacio */}
        {matches.length > 0 ? (
          matches.map(match => (
            <div key={match._id} className="match-card">
              <span>{match.equipoLocal.nombre}</span>
              <strong>{match.golesLocal} - {match.golesVisitante}</strong>
              <span>{match.equipoVisitante.nombre}</span>
            </div>
          ))
        ) : (
          <p>No hay partidos registrados.</p>
        )}
      </div>
    </div>
  );
}

export default MatchesPage;