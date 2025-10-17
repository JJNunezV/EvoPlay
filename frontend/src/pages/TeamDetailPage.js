import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; // Usamos nuestro api.js

function TeamDetailPage() {
  const [team, setTeam] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const { id } = useParams(); // Hook para leer el ID del equipo desde la URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hacemos 3 peticiones a la vez para cargar todo
        const teamRes = await api.get(`/equipos/${id}`);
        const upcomingRes = await api.get('/partidos/proximos');
        const recentRes = await api.get('/partidos/recientes');

        setTeam(teamRes.data);

        // Filtramos los partidos para mostrar solo los de este equipo
        setUpcomingMatches(upcomingRes.data.filter(match => match.equipoLocal._id === id || match.equipoVisitante._id === id));
        setRecentMatches(recentRes.data.filter(match => match.equipoLocal._id === id || match.equipoVisitante._id === id));

      } catch (error) {
        console.error("Error al cargar los datos del equipo", error);
      }
    };
    fetchData();
  }, [id]); // Se ejecuta cada vez que el ID en la URL cambie

  if (!team) {
    return <p>Cargando información del equipo...</p>;
  }

  return (
    <div>
      <div className="team-header">
        <img src={team.logoUrl} alt={`Logo de ${team.nombre}`} width="100" />
        <h1>{team.nombre}</h1>
      </div>

      <h2>Plantilla de Jugadores</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Posición</th>
            <th>Goles</th>
            <th>Asistencias</th>
          </tr>
        </thead>
        <tbody>
          {team.jugadores.map(player => (
            <tr key={player._id}>
              <td>{player.nombre}</td>
              <td>{player.posicion}</td>
              <td>{player.goles}</td>
              <td>{player.asistencias}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Próximos Partidos</h2>
      {upcomingMatches.map(match => (
         <div key={match._id} className="match-card">
           <span>{match.equipoLocal.nombre}</span>
           <strong>VS</strong>
           <span>{match.equipoVisitante.nombre}</span>
         </div>
      ))}

      <h2>Resultados Recientes</h2>
       {recentMatches.map(match => (
         <div key={match._id} className="match-card">
           <span>{match.equipoLocal.nombre}</span>
           <strong>{match.golesLocal} - {match.golesVisitante}</strong>
           <span>{match.equipoVisitante.nombre}</span>
         </div>
      ))}
    </div>
  );
}

export default TeamDetailPage;