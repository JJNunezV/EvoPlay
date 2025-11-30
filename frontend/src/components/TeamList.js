import React from 'react';
import api from '../api';
import { motion } from 'framer-motion'; // Importamos animación

function TeamList({ teams, onTeamDeleted, onEditClick }) {

  const handleDelete = async (teamId) => {
    if (window.confirm('¿Borrar equipo?')) {
      try {
        await api.delete(`/api/equipos/${teamId}`);
        onTeamDeleted();
      } catch (error) { alert('Error al borrar'); }
    }
  };

  // Configuración de la animación escalonada
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 } // Retraso entre cada hijo
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (!teams || teams.length === 0) {
    return <div className="glass-panel" style={{padding:'40px', textAlign:'center', color:'#888'}}>No hay equipos registrados.</div>;
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      style={{display:'grid', gap:'15px'}}
    >
      {teams.map(team => (
        <motion.div 
          key={team._id} 
          variants={itemAnim} // Cada tarjeta se anima individualmente
          className="glass-panel card-hover"
          style={{
            padding: '15px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
             <div style={{width:'60px', height:'60px', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.5)', borderRadius:'50%', border:'1px solid #333'}}>
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt="logo" style={{width:'40px', height:'40px', objectFit:'contain'}}/>
                ) : (
                  <span style={{fontSize:'1.8rem'}}>🛡️</span>
                )}
             </div>
             <div>
               <div style={{color:'white', fontSize: '1.3rem', fontWeight: 'bold', fontFamily:'Oswald, sans-serif'}}>{team.nombre}</div>
               <div style={{display:'flex', gap:'10px', fontSize: '0.85rem', marginTop:'5px'}}>
                 <span style={{color:'black', background:'var(--gold)', padding:'2px 10px', borderRadius:'10px', fontWeight:'bold'}}>
                    {team.categoria || 'General'}
                 </span>
                 <span style={{color:'#aaa', display:'flex', alignItems:'center', gap:'5px'}}>
                    👥 {team.jugadores?.length || 0} Jugadores
                 </span>
               </div>
             </div>
          </div>

          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={() => onEditClick(team)} style={{background: 'var(--gold)', color:'black', padding:'8px 20px', fontSize:'0.9rem'}}>EDITAR</button>
            <button onClick={() => handleDelete(team._id)} className="btn-danger" style={{padding:'8px 20px', fontSize:'0.9rem'}}>BORRAR</button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default TeamList;