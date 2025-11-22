import React, { useState, useEffect } from 'react';
import api from '../api'; // Usamos nuestro api.js centralizado
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [standings, setStandings] = useState([]);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        // 👇 CAMBIO CLAVE AQUÍ: Usamos 'api' en lugar de 'axios'
        const response = await api.get('/partidos/standings');
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
            <tr key={team._id}> {/* Usar team._id es más seguro que el index */}
              <td><Link to={`/equipos/${team._id}`}>{team.nombre}</Link></td>
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