import React, { useState, useEffect } from 'react';
import api from '../api';

function StandingsPage() {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/partidos/standings');
        setStandings(response.data);
      } catch (error) {
        console.error("Error al obtener la tabla de posiciones", error);
      }
    };
    fetchStandings();
  }, []);

  return (
    <div>
      <h1>Tabla de Posiciones</h1>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={index}>
              <td>{team.nombre}</td>
              <td>{team.PJ}</td>
              <td>{team.PG}</td>
              <td>{team.PE}</td>
              <td>{team.PP}</td>
              <td>{team.GF}</td>
              <td>{team.GC}</td>
              <td><strong>{team.PTS}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StandingsPage;