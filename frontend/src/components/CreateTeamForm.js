import React, { useState } from 'react';
import api from '../api';

function CreateTeamForm({ onTeamCreated }) {
  // Estado inicial limpio
  const [formData, setFormData] = useState({
    nombre: '',
    logoUrl: '',
    categoria: 'Fútbol 7',
    jugadores: [] 
  });

  // Función para agregar un jugador vacío a la lista visual
  const addPlayer = () => {
    setFormData({
      ...formData,
      jugadores: [...formData.jugadores, { nombre: '', posicion: 'Medio', rol: 'Titular', goles: 0 }]
    });
  };

  // Función para editar un jugador específico
  const updatePlayer = (index, field, value) => {
    const newJugadores = [...formData.jugadores];
    newJugadores[index][field] = value;
    setFormData({ ...formData, jugadores: newJugadores });
  };

  // Función para borrar un jugador de la lista
  const removePlayer = (index) => {
    const newJugadores = formData.jugadores.filter((_, i) => i !== index);
    setFormData({ ...formData, jugadores: newJugadores });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validación: El nombre es obligatorio
    if (!formData.nombre.trim()) return alert("El nombre del equipo es obligatorio");

    // 2. Limpieza: Quitamos jugadores sin nombre para no enviar basura
    const jugadoresValidos = formData.jugadores.filter(j => j.nombre.trim() !== '');

    const payload = {
      ...formData,
      jugadores: jugadoresValidos
    };

    try {
      // 3. Enviamos al servidor
      console.log("Enviando equipo:", payload); // Para depurar
      await api.post('/api/equipos', payload);
      
      alert(`¡Equipo "${formData.nombre}" creado exitosamente!`);
      
      // 4. Reset y aviso al padre
      setFormData({ nombre: '', logoUrl: '', categoria: 'Fútbol 7', jugadores: [] });
      if(onTeamCreated) onTeamCreated();
      
    } catch (error) {
      console.error('Error al crear:', error.response?.data || error);
      alert('Error al guardar el equipo: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{color:'white'}}>
      <h2 style={{marginTop:0, marginBottom:'20px', color:'#4ade80'}}>➕ Crear Nuevo Equipo</h2>
      
      {/* SELECCIÓN DE CATEGORÍA */}
      <div style={{marginBottom:'15px'}}>
        <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Categoría:</label>
        <select 
          value={formData.categoria} 
          onChange={e => setFormData({...formData, categoria: e.target.value})} 
          style={{width:'100%', padding:'10px', background:'#000', color:'white', border:'1px solid #444', borderRadius:'6px'}}
        >
            <option>Fútbol 7</option>
            <option>Fútbol 11</option>
            <option>Fútbol Rápido</option>
            <option>Pádel</option>
            <option value="Voleibol">Voleibol</option>
        </select>
      </div>

      {/* DATOS DEL EQUIPO */}
      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Nombre:</label>
            <input type="text" placeholder="Ej: Rayados" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} required style={{width:'100%', padding:'10px', background:'#222', border:'1px solid #444', color:'white', borderRadius:'6px'}} />
        </div>
        <div style={{flex:1}}>
            <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Logo (URL):</label>
            <input type="text" placeholder="https://..." value={formData.logoUrl} onChange={e=>setFormData({...formData, logoUrl:e.target.value})} style={{width:'100%', padding:'10px', background:'#222', border:'1px solid #444', color:'white', borderRadius:'6px'}} />
        </div>
      </div>

      {/* LISTA DE JUGADORES */}
      <h4 style={{borderBottom:'1px solid #444', paddingBottom:'5px', color:'var(--gold)', marginTop:'20px'}}>Plantilla de Jugadores</h4>
      
      {formData.jugadores.length === 0 && <p style={{color:'#666', fontSize:'0.9rem'}}>No has agregado jugadores.</p>}

      {formData.jugadores.map((player, i) => (
        <div key={i} style={{display:'flex', gap:'5px', marginBottom:'10px', alignItems:'center'}}>
           <input type="text" placeholder="Nombre Jugador" value={player.nombre} onChange={e=>updatePlayer(i, 'nombre', e.target.value)} style={{flex:2, padding:'8px', background:'#1a1a1a', border:'1px solid #333', color:'white', borderRadius:'4px'}} required/>
           
           <select value={player.posicion} onChange={e=>updatePlayer(i, 'posicion', e.target.value)} style={{flex:1, padding:'8px', background:'#1a1a1a', border:'1px solid #333', color:'white', borderRadius:'4px'}}>
             <option>Portero</option><option>Defensa</option><option>Medio</option><option>Delantero</option>
           </select>
           
           <select value={player.rol} onChange={e=>updatePlayer(i, 'rol', e.target.value)} style={{width:'80px', padding:'8px', background: player.rol==='Titular'?'#1e293b':'#333', border:'1px solid #333', color:'white', borderRadius:'4px'}}>
             <option>Titular</option><option>Suplente</option>
           </select>

           <button type="button" onClick={()=>removePlayer(i)} style={{background:'#ef4444', color:'white', border:'none', padding:'8px 12px', borderRadius:'4px', cursor:'pointer'}}>X</button>
        </div>
      ))}
      
      <button type="button" onClick={addPlayer} style={{marginBottom:'20px', background:'#28a745', border:'none', color:'white', padding:'8px 15px', borderRadius:'4px', cursor:'pointer', fontSize:'0.9rem'}}>
        + Agregar Jugador
      </button>

      <hr style={{borderColor:'#333', marginBottom:'20px'}}/>

      <button type="submit" style={{width:'100%', padding:'15px', background:'var(--gold)', border:'none', fontWeight:'bold', cursor:'pointer', borderRadius:'8px', fontSize:'1.1rem', color:'black'}}>
        GUARDAR EQUIPO
      </button>
    </form>
  );
}

export default CreateTeamForm;