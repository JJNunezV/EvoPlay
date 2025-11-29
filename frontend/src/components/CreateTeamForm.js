import React, { useState } from 'react';
import api from '../api';

function CreateTeamForm({ onTeamCreated }) {
  const [formData, setFormData] = useState({ nombre: '', logoUrl: '', categoria: 'Fútbol 7', jugadores: [] });

  const addPlayer = () => setFormData({...formData, jugadores: [...formData.jugadores, { nombre: '', posicion: 'Medio', rol: 'Titular' }] });

  const updatePlayer = (idx, field, val) => {
    const newP = [...formData.jugadores];
    newP[idx][field] = val;
    setFormData({...formData, jugadores: newP});
  };

  const removePlayer = (idx) => {
    const newP = formData.jugadores.filter((_, i) => i !== idx);
    setFormData({...formData, jugadores: newP});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/equipos', formData);
      alert('¡Equipo creado!');
      setFormData({ nombre: '', logoUrl: '', categoria: 'Fútbol 7', jugadores: [] });
      onTeamCreated();
    } catch (e) { alert('Error al crear'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{color:'white'}}>
      <h2 style={{marginTop:0, color:'#4ade80'}}>➕ Crear Nuevo Equipo</h2>
      
      <div style={{marginBottom:'15px'}}>
        <label style={{display:'block', marginBottom:'5px', color:'#aaa'}}>Categoría:</label>
        <select value={formData.categoria} onChange={e=>setFormData({...formData, categoria:e.target.value})} style={{width:'100%', padding:'10px', background:'#000', color:'white', border:'1px solid #444'}}>
            <option>Fútbol 7</option><option>Fútbol 11</option><option>Fútbol Rápido</option><option>Pádel</option><option>Voleibol</option>
        </select>
      </div>

      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <input type="text" placeholder="Nombre del Equipo" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} required style={{flex:1, padding:'10px', background:'#222', border:'1px solid #444', color:'white'}} />
        <input type="text" placeholder="URL Logo" value={formData.logoUrl} onChange={e=>setFormData({...formData, logoUrl:e.target.value})} style={{flex:1, padding:'10px', background:'#222', border:'1px solid #444', color:'white'}} />
      </div>

      <h4 style={{borderBottom:'1px solid #444', paddingBottom:'5px'}}>Jugadores</h4>
      {formData.jugadores.map((p, i) => (
        <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
           <input type="text" placeholder="Nombre" value={p.nombre} onChange={e=>updatePlayer(i, 'nombre', e.target.value)} style={{flex:2, padding:'5px'}} required/>
           <select value={p.posicion} onChange={e=>updatePlayer(i, 'posicion', e.target.value)} style={{flex:1}}><option>Portero</option><option>Defensa</option><option>Medio</option><option>Delantero</option></select>
           <button type="button" onClick={()=>removePlayer(i)} style={{background:'red', color:'white', border:'none'}}>X</button>
        </div>
      ))}
      <button type="button" onClick={addPlayer} style={{marginBottom:'15px', background:'#28a745', border:'none', color:'white', padding:'5px 10px', borderRadius:'4px'}}>+ Jugador</button>

      <button type="submit" style={{width:'100%', padding:'12px', background:'var(--gold)', border:'none', fontWeight:'bold', cursor:'pointer'}}>CREAR EQUIPO</button>
    </form>
  );
}
export default CreateTeamForm;