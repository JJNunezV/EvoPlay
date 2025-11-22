import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function TeamDetailPage() {
  const [team, setTeam] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 👇 AQUÍ ESTÁN LOS CAMBIOS: Agregamos '/api' a las 3 peticiones
        const teamRes = await api.get(`/api/equipos/${id}`);
        const upcomingRes = await api.get('/api/partidos/proximos');
        const recentRes = await api.get('/api/partidos/recientes');
        
        setTeam(teamRes.data);
        
        // Filtramos los partidos
        setUpcomingMatches(upcomingRes.data.filter(match => match.equipoLocal._id === id || match.equipoVisitante._id === id));
        setRecentMatches(recentRes.data.filter(match => match.equipoLocal._id === id || match.equipoVisitante._id === id));

      } catch (error) {
        console.error("Error al cargar los datos del equipo", error);
      }
    };
    fetchData();
  }, [id]);

  if (!team) {
    return <p>Cargando información del equipo...</p>;
  }

  return (
    <div>
      <div className="team-header">
        {/* Agregamos chequeo por si no hay logo */}
        {team.logoUrl && <img src={team.logoUrl} alt={`Logo de ${team.nombre}`} width="100" />}
        <h1>{team.nombre}</h1>
      </div>

      <h2>Plantilla de Jugadores</h2>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Nombre</th><th>Posición</th><th>Goles</th><th>Asistencias</th>
          </tr>
        </thead>
        <tbody>
          {team.jugadores && team.jugadores.map(player => (
            <tr key={player._id}>
              <td>{player.nombre}</td>
              <td>{player.posicion || 'N/A'}</td>
              <td>{player.goles}</td>
              <td>{player.asistencias}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Próximos Partidos</h2>
      {upcomingMatches.length > 0 ? upcomingMatches.map(match => (
         <div key={match._id} className="match-card">
           <span>{match.equipoLocal.nombre}</span>
           <strong>VS</strong>
           <span>{match.equipoVisitante.nombre}</span>
         </div>
      )) : <p>No hay partidos próximos.</p>}

      <h2>Resultados Recientes</h2>
       {recentMatches.length > 0 ? recentMatches.map(match => (
         <div key={match._id} className="match-card">
           <span>{match.equipoLocal.nombre}</span>
           <strong>{match.golesLocal} - {match.golesVisitante}</strong>
           <span>{match.equipoVisitante.nombre}</span>
         </div>
      )) : <p>No hay resultados recientes.</p>}
    </div>
  );
}

export default TeamDetailPage;