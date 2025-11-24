const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  // Identificador único (siempre usaremos el mismo documento)
  id: { type: String, default: 'global_config' },
  
  // --- COLORES ---
  colores: {
    primary: { type: String, default: '#c5a059' },    // El Dorado actual
    secondary: { type: String, default: '#0e0e0e' },  // El Negro actual
    text: { type: String, default: '#ffffff' }         // Texto blanco
  },

  // --- TEXTOS E IMAGENES ---
  hero: {
    titulo: { type: String, default: 'EVOPLAY LEAGUE' },
    subtitulo: { type: String, default: 'TORNEO CLAUSURA 2025' },
    imagenFondo: { type: String, default: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6' }
  },

  footer: {
    texto: { type: String, default: 'La plataforma exclusiva para la gestión deportiva.' },
    contacto: { type: String, default: 'contacto@evoplay.com' }
  }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);
module.exports = Config;