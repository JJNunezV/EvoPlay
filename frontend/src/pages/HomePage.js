import React, { useState, useEffect } from 'react';
import api from '../api';
import UpcomingMatchesWidget from '../components/UpcomingMatchesWidget';
import TopScorersWidget from '../components/TopScorersWidget'; // <-- La corrección está aquí

function HomePage() {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [matchesRes, scorersRes] = await Promise.all([
          api.get('/partidos/proximos'),
          api.get('/equipos/stats/goleadores')
        ]);
        setUpcomingMatches(matchesRes.data);
        setTopScorers(scorersRes.data);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard", error);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div>
      <h1>¡Bienvenido a EvoPlay!</h1>
      <p>La mejor plataforma para gestionar tus ligas de fútbol y pádel.</p>
      <div className="dashboard-grid">
        <UpcomingMatchesWidget matches={upcomingMatches} />
        <TopScorersWidget scorers={topScorers} />
      </div>
    </div>
  );
}

export default HomePage;