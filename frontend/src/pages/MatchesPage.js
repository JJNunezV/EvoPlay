import React, { useState, useEffect } from 'react';
import api from '../api';
import CreateMatchForm from '../components/CreateMatchForm';

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  // 👇 TRUCO: Verificamos si hay un token guardado para saber si es admin
  const isAdmin = !!localStorage.getItem('token');

  const fetchMatches = async () => {
    try {
      const response = await api.get('/api/partidos');
      // Ordenamos: primero los más recientes
      const partidosOrdenados = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setMatches(partidosOrdenados);
    } catch (error) {
      console.error("Error al obtener los partidos", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Función para formatear la fecha bonita
  const formatearFecha = (fechaString) => {
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
  };

  return (
    <div>
      <h1>Resultados y Calendario</h1>

      {/* 👇 CONDICIONAL: Solo mostramos el formulario si es Admin */}
      {isAdmin && (
        <div style={{marginBottom: '40px', border: '2px dashed #007bff', padding: '20px', borderRadius: '10px'}}>
          <h3 style={{marginTop: 0, color: '#007bff'}}>Panel de Administrador</h3>
          <CreateMatchForm onMatchCreated={fetchMatches} />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {matches.length > 0 ? (
          matches.map(match => (
            <div key={match._id} className="match-card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '10px',
              backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              {/* Equipo Local */}
              <div style={{flex: 1, textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem'}}>
                {match.equipoLocal.nombre}
                {match.equipoLocal.logoUrl && <img src={match.equipoLocal.logoUrl} alt="logo" width="30" style={{marginLeft: '10px', verticalAlign: 'middle'}}/>}
              </div>

              {/* Marcador Central */}
              <div style={{margin: '0 20px', textAlign: 'center'}}>
                <div style={{fontSize: '1.5rem', fontWeight: 'bold', backgroundColor: '#333', color: '#fff', padding: '5px 15px', borderRadius: '8px'}}>
                  {match.golesLocal} - {match.golesVisitante}
                </div>
                <small style={{color: '#777'}}>{formatearFecha(match.fecha)}</small>
              </div>

              {/* Equipo Visitante */}
              <div style={{flex: 1, textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem'}}>
                {match.equipoVisitante.logoUrl && <img src={match.equipoVisitante.logoUrl} alt="logo" width="30" style={{marginRight: '10px', verticalAlign: 'middle'}}/>}
                {match.equipoVisitante.nombre}
              </div>
            </div>
          ))
        ) : (
          <p style={{textAlign: 'center', color: '#777'}}>No hay partidos registrados aún.</p>
        )}
      </div>
    </div>
  );
}

export default MatchesPage;