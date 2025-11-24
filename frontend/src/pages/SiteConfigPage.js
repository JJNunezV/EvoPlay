import React, { useState, useEffect } from 'react';
import api from '../api';

function SiteConfigPage() {
  const [config, setConfig] = useState(null);

  // Cargar configuración actual
  useEffect(() => {
    api.get('/api/config').then(res => setConfig(res.data));
  }, []);

  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      await api.put('/api/config', config);
      alert('¡Cambios guardados! Recarga la página para ver el nuevo estilo.');
      window.location.reload(); // Recarga forzada para aplicar estilos
    } catch (error) {
      alert('Error al guardar');
    }
  };

  if (!config) return <p>Cargando editor...</p>;

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <h1>🎨 Editor de Sitio Web</h1>
      
      <div className="widget" style={{marginBottom: '20px'}}>
        <h3>Colores del Tema</h3>
        <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
          <div>
            <label>Color Principal (Dorado):</label>
            <input type="color" value={config.colores.primary} 
                   onChange={e => handleChange('colores', 'primary', e.target.value)} 
                   style={{height: '50px', width: '100px', padding: 0}}/>
          </div>
          <div>
            <label>Color de Fondo:</label>
            <input type="color" value={config.colores.secondary} 
                   onChange={e => handleChange('colores', 'secondary', e.target.value)} 
                   style={{height: '50px', width: '100px', padding: 0}}/>
          </div>
        </div>
      </div>

      <div className="widget" style={{marginBottom: '20px'}}>
        <h3>Banner Principal (Hero)</h3>
        <label>Título Principal:</label>
        <input type="text" value={config.hero.titulo} 
               onChange={e => handleChange('hero', 'titulo', e.target.value)} />
        
        <label style={{marginTop: '10px'}}>Subtítulo:</label>
        <input type="text" value={config.hero.subtitulo} 
               onChange={e => handleChange('hero', 'subtitulo', e.target.value)} />
        
        <label style={{marginTop: '10px'}}>URL Imagen de Fondo:</label>
        <input type="text" value={config.hero.imagenFondo} 
               onChange={e => handleChange('hero', 'imagenFondo', e.target.value)} />
        <small>Pega un link de imagen (ej. de Unsplash)</small>
      </div>

      <div className="widget" style={{marginBottom: '20px'}}>
        <h3>Pie de Página (Footer)</h3>
        <label>Texto de la Marca:</label>
        <textarea value={config.footer.texto} 
               onChange={e => handleChange('footer', 'texto', e.target.value)} 
               rows="3" style={{background:'#333', color:'white', width:'100%', border:'1px solid #555'}} />
      </div>

      <button onClick={handleSave} style={{width: '100%', fontSize: '1.2rem'}}>💾 Guardar y Aplicar Diseño</button>
    </div>
  );
}

export default SiteConfigPage;