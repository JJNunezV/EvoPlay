const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  posicion: { type: String, default: 'N/A' },
  goles: { type: Number, default: 0 },
  asistencias: { type: Number, default: 0 }
});

const equipoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: false
  },
  // 👇 NUEVO CAMPO
  categoria: {
    type: String,
    required: true,
    enum: ['Fútbol 7', 'Fútbol 11', 'Fútbol Rápido', 'Pádel', 'Voleibol'], // Puedes agregar más aquí
    default: 'Fútbol 7'
  },
  jugadores: [jugadorSchema]
}, { timestamps: true });

const Equipo = mongoose.model('Equipo', equipoSchema);

module.exports = Equipo;