const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  type: String, // 'upcoming', 'recent', 'scorers', 'text'
  title: String,
  content: String, // <-- NUEVO: Para escribir noticias
  isVisible: { type: Boolean, default: true }
});

const configSchema = new mongoose.Schema({
  id: { type: String, default: 'global_config' },
  
  // Estilo Global
  style: {
    fontFamily: { type: String, default: 'font-modern' }, // modern, sport, classic
    primaryColor: { type: String, default: '#c5a059' }
  },

  hero: {
    titulo: { type: String, default: 'EVOPLAY LEAGUE' },
    subtitulo: { type: String, default: 'TORNEO 2025' },
    imagenFondo: { type: String, default: '' }
  },

  footer: {
    texto: { type: String, default: 'Gestión deportiva profesional.' },
    contacto: { type: String, default: 'contacto@evoplay.com' }
  },

  pages: {
    home: [widgetSchema]
  }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
module.exports = Config;