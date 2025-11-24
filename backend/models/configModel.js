const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  id: { type: String, default: 'global_config' },
  
  colores: {
    primary: { type: String, default: '#c5a059' },
    secondary: { type: String, default: '#0e0e0e' },
    text: { type: String, default: '#ffffff' }
  },

  hero: {
    titulo: { type: String, default: 'EVOPLAY LEAGUE' },
    subtitulo: { type: String, default: 'TORNEO CLAUSURA 2025' },
    imagenFondo: { type: String, default: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6' }
  },

  footer: {
    texto: { type: String, default: 'La plataforma exclusiva para la gestión deportiva.' },
    contacto: { type: String, default: 'contacto@evoplay.com' }
  },

  // 👇 NUEVA SECCIÓN: CONTROL DE DISEÑO
  layout: {
    home: {
      // Definimos qué widget va en qué posición
      section1: { type: String, default: 'upcoming' }, // upcoming, recent, scorers, none
      section2: { type: String, default: 'recent' },
      section3: { type: String, default: 'scorers' },
      
      // Títulos personalizados para cada sección
      title1: { type: String, default: '🔥 Próximos Partidos' },
      title2: { type: String, default: '📊 Resultados Recientes' },
      title3: { type: String, default: '🏆 Goleadores' }
    }
  }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
module.exports = Config;