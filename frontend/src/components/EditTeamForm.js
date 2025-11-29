import React, { useState, useEffect } from 'react';
import api from '../api';

function EditTeamForm({ team, onUpdateComplete }) {
  const [formData, setFormData] = useState({ nombre: '', logoUrl: '', categoria: '', jugadores: [] });

  useEffect(() => {
    if (team) setFormData(team);
  }, [team]);

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
      await api.put(`/api/equipos/${team._id}`, formData);
      alert('¡Actualizado!');
      onUpdateComplete();
    } catch (e) { alert('Error al actualizar'); }
  };

  return (
    <form onSubmit={handleSubmit} style={{color:'white'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
         <h2 style={{marginTop:0, color:'var(--gold)'}}>✏️ Editando: {team.nombre}</h2>
         <button type="button" onClick={onUpdateComplete} style={{background:'none', border:'1px solid #555', color:'white', padding:'5px 10px'}}>Cancelar</button>
      </div>

      <div style={{marginBottom:'15px'}}>
        <label style={{color:'#aaa'}}>Categoría:</label>
        <select value={formData.categoria} onChange={e=>setFormData({...formData, categoria:e.target.value})} style={{width:'100%', padding:'10px', background:'#000', color:'white', border:'1px solid #444'}}>
            <option>Fútbol 7</option><option>Fútbol 11</option><option>Fútbol Rápido</option><option>Pádel</option><option>Voleibol</option>
        </select>
      </div>

      <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
        <input type="text" value={formData.nombre} onChange={e=>setFormData({...formData, nombre:e.target.value})} required style={{flex:1, padding:'10px', background:'#222', border:'1px solid #444', color:'white'}} />
        <input type="text" value={formData.logoUrl} onChange={e=>setFormData({...formData, logoUrl:e.target.value})} style={{flex:1, padding:'10px', background:'#222', border:'1px solid #444', color:'white'}} />
      </div>

      <h4>Jugadores</h4>
      <div style={{maxHeight:'300px', overflowY:'auto', border:'1px solid #333', padding:'10px', marginBottom:'10px'}}>
        {formData.jugadores.map((p, i) => (
            <div key={i} style={{display:'flex', gap:'5px', marginBottom:'5px'}}>
            <input type="text" value={p.nombre} onChange={e=>updatePlayer(i, 'nombre', e.target.value)} style={{flex:2, padding:'5px'}} required/>
            <input type="number" placeholder="Goles" value={p.goles||0} onChange={e=>updatePlayer(i, 'goles', parseInt(e.target.value))} style={{width:'50px'}} />
            <button type="button" onClick={()=>removePlayer(i)} style={{background:'red', color:'white', border:'none'}}>X</button>
            </div>
        ))}
      </div>
      <button type="button" onClick={addPlayer} style={{marginBottom:'15px', background:'#28a745', border:'none', color:'white', padding:'5px 10px', borderRadius:'4px'}}>+ Jugador</button>

      <button type="submit" style={{width:'100%', padding:'12px', background:'var(--gold)', border:'none', fontWeight:'bold', cursor:'pointer'}}>GUARDAR CAMBIOS</button>
    </form>
  );
}
export default EditTeamForm;