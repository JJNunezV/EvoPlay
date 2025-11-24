import React, { useState, useEffect } from 'react';
import api from '../api';

function SiteConfigPage() {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // Pestañas: general, home, footer
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/config').then(res => {
      const data = res.data;
      if (!data.style) data.style = { fontFamily: 'font-modern', primaryColor: '#c5a059' };
      if (!data.pages) data.pages = { home: [] };
      setConfig(data);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/api/config', config);
      alert('¡Cambios guardados exitosamente!');
      window.location.reload();
    } catch (error) { alert('Error al guardar'); }
    setLoading(false);
  };

  // Helpers de actualización
  const updateConfig = (section, field, value) => {
    setConfig(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  // Helpers de Widgets (Drag/Drop/Add)
  const addWidget = (type) => {
    const titleMap = { upcoming: 'Próximos Partidos', recent: 'Resultados', scorers: 'Goleadores', text: 'Noticia / Aviso' };
    const newWidget = { type, title: titleMap[type], content: '', isVisible: true };
    setConfig(prev => ({
      ...prev,
      pages: { ...prev.pages, home: [...prev.pages.home, newWidget] }
    }));
  };

  const updateWidget = (index, field, value) => {
    const newWidgets = [...config.pages.home];
    newWidgets[index][field] = value;
    setConfig(prev => ({ ...prev, pages: { ...prev.pages, home: newWidgets } }));
  };

  const removeWidget = (index) => {
    if(!window.confirm("¿Borrar esta sección?")) return;
    const newWidgets = config.pages.home.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, pages: { ...prev.pages, home: newWidgets } }));
  };

  const moveWidget = (index, direction) => {
    const newWidgets = [...config.pages.home];
    if (direction === 'up' && index > 0) {
      [newWidgets[index], newWidgets[index - 1]] = [newWidgets[index - 1], newWidgets[index]];
    } else if (direction === 'down' && index < newWidgets.length - 1) {
      [newWidgets[index], newWidgets[index + 1]] = [newWidgets[index + 1], newWidgets[index]];
    }
    setConfig(prev => ({ ...prev, pages: { ...prev.pages, home: newWidgets } }));
  };

  if (!config) return <div style={{padding:40, color:'white'}}>Cargando panel...</div>;

  return (
    <div className="admin-container">
      {/* --- SIDEBAR (Menú Lateral) --- */}
      <div className="admin-sidebar">
        <h2 style={{color: config.style.primaryColor, padding:'0 15px'}}>EDITOR</h2>
        <div className={`admin-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>🎨 Estilo & Banner</div>
        <div className={`admin-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>🏠 Página de Inicio</div>
        <div className={`admin-tab ${activeTab === 'footer' ? 'active' : ''}`} onClick={() => setActiveTab('footer')}>🔻 Pie de Página</div>
        
        <div style={{marginTop:'auto'}}>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'GUARDAR TODO'}
          </button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="admin-content">
        
        {/* PESTAÑA: GENERAL */}
        {activeTab === 'general' && (
          <div>
            <h1>Estilo General y Banner</h1>
            <div className="form-group">
              <label className="form-label">Color Principal (Marca)</label>
              <div style={{display:'flex', gap:'10px'}}>
                <input type="color" value={config.style.primaryColor} onChange={e => updateConfig('style', 'primaryColor', e.target.value)} style={{height:50, width:50, cursor:'pointer', border:'none'}}/>
                <input type="text" className="styled-input" value={config.style.primaryColor} readOnly style={{width:150}}/>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tipografía (Fuente)</label>
              <select className="styled-select" value={config.style.fontFamily} onChange={e => updateConfig('style', 'fontFamily', e.target.value)}>
                <option value="font-modern">Montserrat (Moderna & Limpia)</option>
                <option value="font-sport">Oswald (Deportiva & Fuerte)</option>
                <option value="font-classic">Playfair (Elegante & Seria)</option>
                <option value="font-tech">Roboto Mono (Técnica)</option>
              </select>
            </div>

            <hr style={{borderColor:'#333', margin:'30px 0'}}/>
            
            <h3>Banner Principal</h3>
            <div className="form-group">
              <label className="form-label">Título Gigante</label>
              <input type="text" className="styled-input" value={config.hero.titulo} onChange={e => updateConfig('hero', 'titulo', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Subtítulo</label>
              <input type="text" className="styled-input" value={config.hero.subtitulo} onChange={e => updateConfig('hero', 'subtitulo', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">URL Imagen de Fondo</label>
              <input type="text" className="styled-input" value={config.hero.imagenFondo} onChange={e => updateConfig('hero', 'imagenFondo', e.target.value)} />
            </div>
          </div>
        )}

        {/* PESTAÑA: HOME LAYOUT */}
        {activeTab === 'home' && (
          <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h1>Constructor de Inicio</h1>
              <div style={{display:'flex', gap:'10px'}}>
                <button className="btn-icon" style={{width:'auto', padding:'0 15px'}} onClick={() => addWidget('text')}>+ Noticia</button>
                <button className="btn-icon" style={{width:'auto', padding:'0 15px'}} onClick={() => addWidget('upcoming')}>+ Partidos</button>
              </div>
            </div>
            
            <p style={{color:'#666', marginBottom:'20px'}}>Arrastra mentalmente: Usa las flechas para ordenar qué sale primero.</p>

            {config.pages.home.map((widget, index) => (
              <div key={index} className="draggable-item">
                <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'5px'}}>
                  <button className="btn-icon" onClick={() => moveWidget(index, 'up')}>⬆</button>
                  <span style={{color:'#666', fontWeight:'bold'}}>{index + 1}</span>
                  <button className="btn-icon" onClick={() => moveWidget(index, 'down')}>⬇</button>
                </div>

                <div style={{flex: 1}}>
                  <div style={{display:'flex', gap:'10px', marginBottom:'5px'}}>
                    <span className="badge">{widget.type}</span>
                    <input type="text" className="styled-input" style={{padding:'5px', fontSize:'0.9rem'}} 
                           value={widget.title} onChange={e => updateWidget(index, 'title', e.target.value)} placeholder="Título de la sección"/>
                  </div>
                  
                  {/* Si es tipo TEXTO, mostramos el área para escribir */}
                  {widget.type === 'text' && (
                    <textarea className="styled-textarea" rows="3" placeholder="Escribe aquí el contenido de la noticia..."
                              value={widget.content} onChange={e => updateWidget(index, 'content', e.target.value)}></textarea>
                  )}
                </div>

                <button className="btn-icon btn-delete" onClick={() => removeWidget(index)}>✖</button>
              </div>
            ))}

            <div style={{marginTop:'20px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <small style={{color:'#666'}}>Agregar más:</small>
              <button onClick={() => addWidget('upcoming')} style={{background:'none', border:'1px solid #444', color:'white', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Próximos</button>
              <button onClick={() => addWidget('recent')} style={{background:'none', border:'1px solid #444', color:'white', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Resultados</button>
              <button onClick={() => addWidget('scorers')} style={{background:'none', border:'1px solid #444', color:'white', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Goleadores</button>
              <button onClick={() => addWidget('text')} style={{background:'none', border:'1px solid #444', color:'var(--gold)', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>Texto/Noticia</button>
            </div>
          </div>
        )}

        {/* PESTAÑA: FOOTER */}
        {activeTab === 'footer' && (
          <div>
            <h1>Pie de Página</h1>
            <div className="form-group">
              <label className="form-label">Texto de Derechos de Autor / Slogan</label>
              <textarea className="styled-textarea" rows="4" value={config.footer.texto} onChange={e => updateConfig('footer', 'texto', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email de Contacto</label>
              <input type="text" className="styled-input" value={config.footer.contacto} onChange={e => updateConfig('footer', 'contacto', e.target.value)} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default SiteConfigPage;