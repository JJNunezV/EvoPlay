import React, { useState, useEffect } from 'react';
import api from '../api';

function SiteConfigPage() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/api/config').then(res => setConfig(res.data));
  }, []);

  // Función genérica para actualizar cualquier campo
  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Función especial para actualizar el layout (anidado)
  const handleLayoutChange = (page, field, value) => {
    setConfig(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [page]: {
          ...prev.layout[page],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    try {
      await api.put('/api/config', config);
      alert('¡Diseño guardado! Recarga para ver los cambios.');
      window.location.reload();
    } catch (error) {
      alert('Error al guardar');
    }
  };

  if (!config) return <p style={{color:'white', textAlign:'center'}}>Cargando editor...</p>;

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto', color:'white'}}>
      <h1>🎨 Editor Maestro del Sitio</h1>
      
      {/* --- SECCIÓN DE COLORES --- */}
      <div className="widget" style={{marginBottom: '20px', background:'#1a1a1a', padding:'20px', borderRadius:'8px'}}>
        <h3>🎨 Colores y Tema</h3>
        <div style={{display: 'flex', gap: '20px'}}>
          <div>
            <label>Color Principal:</label>
            <input type="color" value={config.colores.primary} 
                   onChange={e => handleChange('colores', 'primary', e.target.value)} 
                   style={{height: '40px', width: '100px', padding: 0, cursor:'pointer'}}/>
          </div>
          <div>
            <label>Fondo:</label>
            <input type="color" value={config.colores.secondary} 
                   onChange={e => handleChange('colores', 'secondary', e.target.value)} 
                   style={{height: '40px', width: '100px', padding: 0, cursor:'pointer'}}/>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE CONTENIDO HERO --- */}
      <div className="widget" style={{marginBottom: '20px', background:'#1a1a1a', padding:'20px', borderRadius:'8px'}}>
        <h3>🏟️ Banner Principal</h3>
        <label>Título:</label>
        <input type="text" value={config.hero.titulo} onChange={e => handleChange('hero', 'titulo', e.target.value)} style={{width:'100%', marginBottom:'10px'}}/>
        <label>Subtítulo:</label>
        <input type="text" value={config.hero.subtitulo} onChange={e => handleChange('hero', 'subtitulo', e.target.value)} style={{width:'100%', marginBottom:'10px'}}/>
        <label>URL Imagen:</label>
        <input type="text" value={config.hero.imagenFondo} onChange={e => handleChange('hero', 'imagenFondo', e.target.value)} style={{width:'100%'}}/>
      </div>

      {/* --- SECCIÓN NUEVA: ORDEN DE LA PÁGINA DE INICIO --- */}
      <div className="widget" style={{marginBottom: '20px', background:'#222', padding:'20px', borderRadius:'8px', border:'2px solid #c5a059'}}>
        <h3 style={{color:'#c5a059'}}>🧩 Estructura de Página de Inicio</h3>
        <p style={{fontSize:'0.9rem', color:'#ccc'}}>Elige qué mostrar y en qué orden. Usa "Ocultar" para quitar una sección.</p>

        {/* SLOT 1 */}
        <div style={{marginBottom:'15px', padding:'10px', border:'1px solid #444', borderRadius:'5px'}}>
          <label style={{color:'#fff'}}>Posición 1 (Izquierda Arriba):</label>
          <select 
            value={config.layout?.home?.section1 || 'upcoming'} 
            onChange={e => handleLayoutChange('home', 'section1', e.target.value)}
            style={{width:'100%', marginBottom:'5px'}}
          >
            <option value="upcoming">Próximos Partidos</option>
            <option value="recent">Resultados Recientes</option>
            <option value="scorers">Tabla de Goleadores</option>
            <option value="none">-- OCULTAR --</option>
          </select>
          <input type="text" placeholder="Título de la sección" value={config.layout?.home?.title1} onChange={e => handleLayoutChange('home', 'title1', e.target.value)} style={{width:'100%'}}/>
        </div>

        {/* SLOT 2 */}
        <div style={{marginBottom:'15px', padding:'10px', border:'1px solid #444', borderRadius:'5px'}}>
          <label style={{color:'#fff'}}>Posición 2 (Izquierda Abajo):</label>
          <select 
            value={config.layout?.home?.section2 || 'recent'} 
            onChange={e => handleLayoutChange('home', 'section2', e.target.value)}
            style={{width:'100%', marginBottom:'5px'}}
          >
            <option value="upcoming">Próximos Partidos</option>
            <option value="recent">Resultados Recientes</option>
            <option value="scorers">Tabla de Goleadores</option>
            <option value="none">-- OCULTAR --</option>
          </select>
          <input type="text" placeholder="Título de la sección" value={config.layout?.home?.title2} onChange={e => handleLayoutChange('home', 'title2', e.target.value)} style={{width:'100%'}}/>
        </div>

        {/* SLOT 3 */}
        <div style={{marginBottom:'15px', padding:'10px', border:'1px solid #444', borderRadius:'5px'}}>
          <label style={{color:'#fff'}}>Posición 3 (Columna Derecha):</label>
          <select 
            value={config.layout?.home?.section3 || 'scorers'} 
            onChange={e => handleLayoutChange('home', 'section3', e.target.value)}
            style={{width:'100%', marginBottom:'5px'}}
          >
            <option value="upcoming">Próximos Partidos</option>
            <option value="recent">Resultados Recientes</option>
            <option value="scorers">Tabla de Goleadores</option>
            <option value="none">-- OCULTAR --</option>
          </select>
          <input type="text" placeholder="Título de la sección" value={config.layout?.home?.title3} onChange={e => handleLayoutChange('home', 'title3', e.target.value)} style={{width:'100%'}}/>
        </div>

      </div>

      <div className="widget" style={{marginBottom: '20px', background:'#1a1a1a', padding:'20px', borderRadius:'8px'}}>
        <h3>Pie de Página</h3>
        <input type="text" value={config.footer.texto} onChange={e => handleChange('footer', 'texto', e.target.value)} style={{width:'100%'}}/>
      </div>

      <button onClick={handleSave} style={{width: '100%', padding:'15px', fontSize: '1.2rem', background:'linear-gradient(45deg, #c5a059, #e6c88b)', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', color:'#000'}}>
        💾 GUARDAR CONFIGURACIÓN
      </button>
    </div>
  );
}

export default SiteConfigPage;