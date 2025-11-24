import React, { useState, useEffect } from 'react';
import api from '../api';

function SiteConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Cargar la configuración actual desde la Nube
  useEffect(() => {
    api.get('/api/config').then(res => {
      const data = res.data;
      // Aseguramos que existan los objetos para que no truene si es nuevo
      if (!data.colores) data.colores = { primary: '#c5a059', secondary: '#0e0e0e', text: '#ffffff' };
      if (!data.hero) data.hero = { titulo: '', subtitulo: '', imagenFondo: '' };
      if (!data.pages) data.pages = { home: [] };
      if (!data.footer) data.footer = { texto: '', contacto: '' };
      
      setConfig(data);
    });
  }, []);

  // --- MANEJADORES DE CAMBIOS ---

  // Para campos simples (ej: footer.texto)
  const handleChange = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Para colores (actualiza el estado y la vista previa en vivo si quisieras)
  const handleColorChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      colores: { ...prev.colores, [field]: value }
    }));
  };

  // --- LÓGICA DE SECCIONES (El constructor) ---
  
  const addWidget = (pageName) => {
    const newWidget = { type: 'upcoming', title: 'Nueva Sección', isVisible: true };
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, [pageName]: [...prev.pages[pageName], newWidget] }
    }));
  };

  const removeWidget = (pageName, index) => {
    if(!window.confirm("¿Eliminar esta sección?")) return;
    const newWidgets = config.pages[pageName].filter((_, i) => i !== index);
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, [pageName]: newWidgets }
    }));
  };

  const updateWidget = (pageName, index, field, value) => {
    const newWidgets = [...config.pages[pageName]];
    newWidgets[index][field] = value;
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, [pageName]: newWidgets }
    }));
  };

  const moveWidget = (pageName, index, direction) => {
    const newWidgets = [...config.pages[pageName]];
    if (direction === 'up' && index > 0) {
      [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
    } else if (direction === 'down' && index < newWidgets.length - 1) {
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    }
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, [pageName]: newWidgets }
    }));
  };

  // --- GUARDAR TODO ---
  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/config', config);
      alert('¡Sitio actualizado con éxito! La página se recargará para aplicar los cambios.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la configuración.');
    }
    setLoading(false);
  };

  if (!config) return <div style={{padding:'50px', color:'white', textAlign:'center'}}>Cargando panel de Dios...</div>;

  return (
    <div style={{padding: '20px', maxWidth: '1000px', margin: '0 auto', color: 'white', paddingBottom: '100px'}}>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h1>🛠️ Constructor de Sitio</h1>
        <button onClick={handleSave} disabled={loading} style={{padding:'15px 30px', fontSize:'1rem', background:'var(--gold)', color:'black', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
          {loading ? 'Guardando...' : '💾 GUARDAR CAMBIOS'}
        </button>
      </div>

      {/* 1. SECCIÓN DE COLORES Y ESTILO */}
      <div className="widget" style={{marginBottom: '20px', background: '#1a1a1a', padding: '20px', borderTop: '4px solid #ff0055'}}>
        <h3>🎨 Paleta de Colores Global</h3>
        <div style={{display: 'flex', gap: '30px', flexWrap: 'wrap'}}>
          <div>
            <label style={{display:'block', marginBottom:'5px'}}>Color Principal (Dorado/Acento):</label>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input type="color" value={config.colores.primary} onChange={e => handleColorChange('primary', e.target.value)} style={{height: '50px', width: '50px', padding: 0, cursor:'pointer', border:'none'}}/>
              <span>{config.colores.primary}</span>
            </div>
          </div>
          <div>
            <label style={{display:'block', marginBottom:'5px'}}>Color de Fondo (Oscuro/Claro):</label>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <input type="color" value={config.colores.secondary} onChange={e => handleColorChange('secondary', e.target.value)} style={{height: '50px', width: '50px', padding: 0, cursor:'pointer', border:'none'}}/>
              <span>{config.colores.secondary}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECCIÓN DEL HEADER Y BANNER */}
      <div className="widget" style={{marginBottom: '20px', background: '#1a1a1a', padding: '20px', borderTop: '4px solid #00d2ff'}}>
        <h3>🚀 Cabecera y Banner Principal</h3>
        
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
          <div>
            <label>Nombre de la Marca (Header):</label>
            <input type="text" value={config.header.titulo} onChange={e => handleChange('header', 'titulo', e.target.value)} style={{width:'100%', marginTop:'5px'}} />
          </div>
          <div>
            <label>Eslogan Pequeño (Header):</label>
            <input type="text" value={config.header.subtitulo} onChange={e => handleChange('header', 'subtitulo', e.target.value)} style={{width:'100%', marginTop:'5px'}} />
          </div>
        </div>

        <hr style={{borderColor:'#333'}}/>

        <div style={{marginTop:'20px'}}>
          <label>Título Gigante del Banner:</label>
          <input type="text" value={config.hero.titulo} onChange={e => handleChange('hero', 'titulo', e.target.value)} style={{width:'100%', marginTop:'5px', fontSize:'1.2rem'}} />
          
          <label style={{marginTop:'15px', display:'block'}}>Subtítulo del Banner:</label>
          <input type="text" value={config.hero.subtitulo} onChange={e => handleChange('hero', 'subtitulo', e.target.value)} style={{width:'100%', marginTop:'5px'}} />
          
          <label style={{marginTop:'15px', display:'block'}}>URL de la Imagen de Fondo:</label>
          <input type="text" value={config.hero.imagenFondo} onChange={e => handleChange('hero', 'imagenFondo', e.target.value)} placeholder="https://..." style={{width:'100%', marginTop:'5px'}} />
          {config.hero.imagenFondo && <img src={config.hero.imagenFondo} alt="preview" style={{marginTop:'10px', height:'100px', borderRadius:'8px', objectFit:'cover'}} />}
        </div>
      </div>

      {/* 3. CONSTRUCTOR DE PÁGINA DE INICIO */}
      <div className="widget" style={{marginBottom: '20px', background: '#222', padding: '20px', border: '2px solid var(--gold)', borderRadius:'8px'}}>
        <h3 style={{color:'var(--gold)', borderBottom:'1px solid #444', paddingBottom:'10px'}}>🏠 Estructura de Página de Inicio (Drag & Drop Simulado)</h3>
        <p style={{color:'#aaa', marginBottom:'20px'}}>Aquí decides qué secciones aparecen y en qué orden.</p>

        {config.pages.home.map((widget, index) => (
          <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', background: '#333', padding: '15px', borderRadius: '8px', alignItems: 'center', borderLeft:'4px solid #666'}}>
            <span style={{color: '#fff', fontWeight: 'bold', fontSize:'1.2rem'}}>#{index + 1}</span>
            
            <div style={{flex: 1, display:'flex', flexDirection:'column', gap:'5px'}}>
              <label style={{fontSize:'0.8rem', color:'#ccc'}}>Tipo de Sección:</label>
              <select value={widget.type} onChange={e => updateWidget('home', index, 'type', e.target.value)} style={{padding:'8px', background:'#222', border:'1px solid #555', color:'white'}}>
                <option value="upcoming">📅 Próximos Partidos</option>
                <option value="recent">📊 Resultados Recientes</option>
                <option value="scorers">🏆 Tabla de Goleadores</option>
                <option value="text">📝 Texto Libre / Aviso</option>
              </select>
            </div>

            <div style={{flex: 2, display:'flex', flexDirection:'column', gap:'5px'}}>
              <label style={{fontSize:'0.8rem', color:'#ccc'}}>Título Visible:</label>
              <input type="text" value={widget.title} onChange={e => updateWidget('home', index, 'title', e.target.value)} style={{width:'100%', padding:'8px'}} />
            </div>

            <div style={{display:'flex', gap:'5px'}}>
              <button onClick={() => moveWidget('home', index, 'up')} disabled={index === 0} style={{background: '#555', padding: '10px', cursor:'pointer'}}>⬆</button>
              <button onClick={() => moveWidget('home', index, 'down')} disabled={index === config.pages.home.length - 1} style={{background: '#555', padding: '10px', cursor:'pointer'}}>⬇</button>
              <button onClick={() => removeWidget('home', index)} style={{background: '#dc3545', padding: '10px', cursor:'pointer'}}>✖</button>
            </div>
          </div>
        ))}

        <button onClick={() => addWidget('home')} style={{marginTop: '15px', background: '#28a745', width: '100%', padding: '12px', fontSize:'1rem', fontWeight:'bold', cursor:'pointer', color:'white', border:'none', borderRadius:'5px'}}>
          + AGREGAR NUEVA SECCIÓN
        </button>
      </div>

      {/* 4. EDITOR DE FOOTER */}
      <div className="widget" style={{marginBottom: '20px', background: '#1a1a1a', padding: '20px', borderTop: '4px solid #888'}}>
        <h3>🔻 Pie de Página (Footer)</h3>
        <label>Texto de Copyright / Marca:</label>
        <input type="text" value={config.footer.texto} onChange={e => handleChange('footer', 'texto', e.target.value)} style={{width:'100%', marginTop:'5px', marginBottom:'15px'}} />
        
        <label>Email de Contacto:</label>
        <input type="text" value={config.footer.contacto} onChange={e => handleChange('footer', 'contacto', e.target.value)} style={{width:'100%', marginTop:'5px'}} />
      </div>

    </div>
  );
}

export default SiteConfigPage;