import React, { useState, useEffect } from 'react';
import api from '../api';

function SiteConfigPage() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/api/config').then(res => {
      // Aseguramos que existan los arrays
      const data = res.data;
      if(!data.pages) data.pages = { home: [] };
      if(!data.header.links) data.header.links = [];
      setConfig(data);
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/api/config', config);
      alert('¡Sitio actualizado! Recarga para ver cambios.');
      window.location.reload();
    } catch (error) { alert('Error al guardar'); }
  };

  // --- FUNCIONES PARA EDITAR ARRAYS (WIDGETS) ---
  const addWidget = (pageName) => {
    const newWidget = { type: 'upcoming', title: 'Nueva Sección', isVisible: true };
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, [pageName]: [...prev.pages[pageName], newWidget] }
    }));
  };

  const removeWidget = (pageName, index) => {
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

  // --- FUNCION PARA MOVER (SUBIR/BAJAR) ---
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

  // --- RENDERIZADOR DE EDITOR DE PÁGINA ---
  const renderPageEditor = (pageName, title) => (
    <div className="widget" style={{marginBottom: '20px', background: '#222', padding: '20px', borderRadius: '8px', border: '1px solid #444'}}>
      <h3 style={{color: 'var(--gold)'}}>{title}</h3>
      
      {config.pages[pageName]?.map((widget, index) => (
        <div key={index} style={{display: 'flex', gap: '10px', marginBottom: '10px', background: '#333', padding: '10px', borderRadius: '5px', alignItems: 'center'}}>
          <span style={{color: '#888', fontWeight: 'bold'}}>#{index + 1}</span>
          
          <select value={widget.type} onChange={e => updateWidget(pageName, index, 'type', e.target.value)} style={{padding:'5px'}}>
            <option value="banner">Banner Gigante</option>
            <option value="upcoming">Próximos Partidos</option>
            <option value="recent">Resultados Recientes</option>
            <option value="scorers">Tabla Goleadores</option>
            <option value="text">Texto Libre / Aviso</option>
          </select>

          <input type="text" value={widget.title} onChange={e => updateWidget(pageName, index, 'title', e.target.value)} placeholder="Título de sección" style={{flex: 1, padding:'5px'}} />

          <button onClick={() => moveWidget(pageName, index, 'up')} style={{background: '#555', padding: '5px'}}>⬆</button>
          <button onClick={() => moveWidget(pageName, index, 'down')} style={{background: '#555', padding: '5px'}}>⬇</button>
          <button onClick={() => removeWidget(pageName, index)} style={{background: 'red', padding: '5px'}}>X</button>
        </div>
      ))}

      <button onClick={() => addWidget(pageName)} style={{marginTop: '10px', background: '#28a745', width: '100%', padding: '8px'}}>+ Agregar Sección</button>
    </div>
  );

  if (!config) return <p>Cargando...</p>;

  return (
    <div style={{padding: '20px', maxWidth: '900px', margin: '0 auto', color: 'white'}}>
      <h1>🛠️ Constructor de Sitio</h1>
      
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <button onClick={handleSave} style={{flex:1, padding:'15px', fontSize:'1.2rem', background:'var(--gold)', color:'black'}}>💾 GUARDAR CAMBIOS</button>
      </div>

      {/* EDITOR DE HEADER */}
      <div className="widget" style={{marginBottom: '20px', background: '#1a1a1a', padding: '20px'}}>
        <h3>Cabecera (Header)</h3>
        <div style={{display:'flex', gap:'10px'}}>
            <input type="text" value={config.header.titulo} onChange={e => setConfig({...config, header: {...config.header, titulo: e.target.value}})} placeholder="Título Principal" />
            <input type="text" value={config.header.subtitulo} onChange={e => setConfig({...config, header: {...config.header, subtitulo: e.target.value}})} placeholder="Subtítulo" />
        </div>
      </div>

      {/* EDITORES DE PÁGINAS */}
      {renderPageEditor('home', '🏠 Página de Inicio')}
      
      {/* EDITOR DE FOOTER */}
      <div className="widget" style={{marginBottom: '20px', background: '#1a1a1a', padding: '20px'}}>
        <h3>Pie de Página</h3>
        <input type="text" value={config.footer.texto} onChange={e => setConfig({...config, footer: {...config.footer, texto: e.target.value}})} />
      </div>

    </div>
  );
}

export default SiteConfigPage;