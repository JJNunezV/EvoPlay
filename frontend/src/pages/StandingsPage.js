import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

function StandingsPage() {
  const [categoria, setCategoria] = useState('Fútbol 7'); // Estado para el filtro
  const [standings, setStandings] = useState([]);
  const [fairPlay, setFairPlay] = useState([]);
  const [sanciones, setSanciones] = useState([]);
  const [goleadores, setGoleadores] = useState([]);

  // Lista de categorías disponibles
  const categorias = ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Enviamos la categoría como parámetro
        const [resStandings, resFairPlay, resSanciones, resGoleadores] = await Promise.all([
          api.get(`/api/partidos/standings?categoria=${categoria}`),
          api.get(`/api/partidos/cards?categoria=${categoria}`),
          api.get(`/api/partidos/sanciones?categoria=${categoria}`),
          api.get(`/api/equipos/stats/goleadores?categoria=${categoria}`) // Necesitas actualizar esta ruta también
        ]);
        setStandings(resStandings.data);
        setFairPlay(resFairPlay.data);
        setSanciones(resSanciones.data);
        setGoleadores(resGoleadores.data);
      } catch (error) { console.error("Error", error); }
    };
    fetchData();
  }, [categoria]); // Se ejecuta cada vez que cambias categoría

  return (
    <div style={{paddingBottom: '50px', maxWidth:'1200px', margin:'0 auto'}}>
      <h1 style={{textAlign:'center', fontSize:'2.5rem', marginBottom:'20px'}}>ESTADÍSTICAS DEL TORNEO</h1>

      {/* --- SELECTOR DE CATEGORÍA --- */}
      <div style={{display:'flex', justifyContent:'center', marginBottom:'40px', gap:'10px', flexWrap:'wrap'}}>
        {categorias.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoria(cat)}
            style={{
              background: categoria === cat ? 'var(--gold)' : '#333',
              color: categoria === cat ? 'black' : 'white',
              border: '1px solid #555',
              padding: '10px 20px',
              borderRadius: '30px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: '0.3s'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* --- TABLAS (Mismo código visual de antes, pero con datos filtrados) --- */}
      <div className="table-card">
        <div className="table-header header-gold">
          <span>🏆</span> Tabla General - {categoria}
        </div>
        <table className="pro-table">
           {/* ... (mismo thead/tbody de antes) ... */}
           {/* Usa standings.map ... */}
        </table>
      </div>
      
      {/* Repite para Goleadores, Fair Play y Sanciones */}
      {/* ... */}
    </div>
  );
}

export default StandingsPage;