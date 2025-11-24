const mongoose = require('mongoose');

// Esquema para un elemento del menú
const linkSchema = new mongoose.Schema({
  texto: String,
  url: String
});

// Esquema para un Widget/Sección
const widgetSchema = new mongoose.Schema({
  type: String, // 'upcoming', 'recent', 'scorers', 'banner', etc.
  title: String,
  isVisible: { type: Boolean, default: true }
});

const configSchema = new mongoose.Schema({
  id: { type: String, default: 'global_config' },
  
  colores: {
    primary: { type: String, default: '#c5a059' },
    secondary: { type: String, default: '#0e0e0e' },
    text: { type: String, default: '#ffffff' }
  },

  // Configuración del Header
  header: {
    titulo: { type: String, default: 'EVOPLAY' },
    subtitulo: { type: String, default: 'LEAGUE' },
    links: [linkSchema] // Lista de enlaces editable
  },

  // Configuración del Footer
  footer: {
    texto: { type: String, default: 'La plataforma exclusiva.' },
    contacto: { type: String, default: 'contacto@evoplay.com' }
  },

  // PÁGINAS DINÁMICAS (Listas de widgets)
  pages: {
    home: [widgetSchema],     // Lista de widgets para Inicio
    partidos: [widgetSchema], // Lista de widgets para Partidos
    tabla: [widgetSchema]     // Lista de widgets para Tabla
  }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
module.exports = Config;