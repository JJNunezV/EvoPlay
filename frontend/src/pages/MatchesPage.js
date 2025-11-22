import React, { useState, useEffect } from 'react';
import api from '../api'; // Usamos nuestra api configurada
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [matches, setMatches] = useState([]);

  const fetchMatches = async () => {
    try {
      // 👇 CAMBIO CLAVE: Usamos api.get y la ruta relativa
      const response = await api.get('/partidos');
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
      <CreateMatchForm onMatchCreated={fetchMatches} />
      <div style={{ marginTop: '20px' }}>
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